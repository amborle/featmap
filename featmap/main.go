//go:generate go-bindata  -pkg migrations -o ./migrations/bindata.go  ./migrations/
//go:generate go-bindata  -pkg tmpl -o ./tmpl/bindata.go  ./tmpl/

package main

import (
	"encoding/json"
	"fmt"
	bindata "github.com/golang-migrate/migrate/v4/source/go_bindata"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/mailgun/mailgun-go/v3"

	"github.com/amborle/featmap/featmap/migrations"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
)

// Configuration ...
type Configuration struct {
	Environment        string `json:"environment"`
	AppSiteURL         string `json:"appSiteURL"`
	DbConnectionString string `json:"dbConnectionString"`
	JWTSecret          string `json:"jwtSecret"`
	Port               string `json:"port"`
	MailServer         string `json:"mailserver"`
	MailgunAPIKey      string `json:"mailgunApiKey"`
}

func main() {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.SetHeader("Content-Type", "application/json"))

	// CORS
	corsConfiguration := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "Workspace", "X-CSRF-Token"},
		ExposedHeaders:   []string{""},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})

	r.Use(corsConfiguration.Handler)

	config, err := readConfiguration()
	if err != nil {
		config = Configuration{
			Environment:        "production",
			AppSiteURL:         "http://localhost",
			DbConnectionString: "postgresql://username:password@localhost:5432/db_name?sslmode=disable",
			JWTSecret:          "some_secret_key",
			Port:               "80",
			MailServer:         "some_mail_server",
			MailgunAPIKey:      "some_mailgun_apikey",
		}
	}

	db, err := sqlx.Connect("postgres", config.DbConnectionString)
	if err != nil {
		log.Fatalln("database error")
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Fatalln(err)
		}
	}()

	// Apply migrations
	s := bindata.Resource(migrations.AssetNames(),
		func(name string) ([]byte, error) {
			return migrations.Asset(name)
		})

	d, err := bindata.WithInstance(s)
	if err != nil {
		log.Fatalln(err)
	}

	m, err := migrate.NewWithSourceInstance("go-bindata", d, config.DbConnectionString)
	if err != nil {
		log.Fatalln(err)
	}

	if err := m.Up(); err != nil {
		log.Println("No database migrations needed.")
	}

	// Mailgun
	mg := mailgun.NewMailgun(config.MailServer, config.MailgunAPIKey)

	// Create JWTAuth object
	auth := jwtauth.New("HS256", []byte(config.JWTSecret), nil)

	r.Use(jwtauth.Verifier(auth))
	r.Use(ContextSkeleton(config))

	r.Use(Transaction(db))
	r.Use(Mailgun(mg))
	r.Use(Auth(auth))

	r.Use(User())

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	// In case somebody visits the root, show simple homepage
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("Featmap"))
	})

	r.Route("/v1/users", usersAPI)     // Nothing is needed
	r.Route("/v1/link", linkAPI)       // Nothing is needed
	r.Route("/v1/account", accountAPI) // Account needed
	r.Route("/v1/", workspaceApi)      // Account + workspace is needed

	fmt.Println("Serving on port " + config.Port)
	_ = http.ListenAndServe(":"+config.Port, r)
}

func readConfiguration() (Configuration, error) {
	file, err := os.Open("conf.json")

	defer func() {
		if err := file.Close(); err != nil {
			log.Println(err)
		}
	}()

	decoder := json.NewDecoder(file)
	configuration := Configuration{}
	err = decoder.Decode(&configuration)
	return configuration, err
}
