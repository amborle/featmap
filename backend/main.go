package backend

import (
	"encoding/json"
	"fmt"
	"github.com/stripe/stripe-go"
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
)

// Configuration ...
type Configuration struct {
	Environment         string
	AppSiteURL          string
	DbConnectionString  string
	JWTSecret           string
	Port                string
	MailServer          string
	MailAPIKey          string
	StripeKey           string
	StripeWebhookSecret string
	StripeBasicPlan     string
	StripeProPlan       string
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
		log.Fatalln(err)
	}

	db, err := sqlx.Connect("postgres", config.DbConnectionString)
	if err != nil {
		log.Fatalln(err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Fatalln(err)
		}
	}()

	mg := mailgun.NewMailgun(config.MailServer, config.MailAPIKey)

	// Create JWTAuth object
	auth := jwtauth.New("HS256", []byte(config.JWTSecret), nil)

	r.Use(jwtauth.Verifier(auth))
	r.Use(ContextSkeleton(config))

	r.Use(Transaction(db))
	r.Use(Mailgun(mg))
	r.Use(Auth(auth))

	r.Use(User())

	stripe.Key = config.StripeKey

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	// In case somebody visits the root, show simple homepage
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("Featmap"))
	})

	r.Route("/v1/users", usersAPI)               // Nothing is needed
	r.Route("/v1/link", linkAPI)                 // Nothing is needed
	r.Route("/v1/account", accountAPI)           // Account needed
	r.Route("/v1/subscription", subscriptionApi) // Nothing is needed
	r.Route("/v1/", workspaceApi)                // Account + workspace is needed

	fmt.Println("Serving on port " + config.Port)
	_ = http.ListenAndServe(":"+config.Port, r)
}

func readConfiguration() (Configuration, error) {
	file, _ := os.Open("conf.json")

	defer func() {
		if err := file.Close(); err != nil {
			// log etc
		}
	}()

	decoder := json.NewDecoder(file)
	configuration := Configuration{}
	err := decoder.Decode(&configuration)
	return configuration, err
}
