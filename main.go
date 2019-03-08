package main

import (
	"encoding/json"
	"fmt"
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
)

// Configuration ...
type Configuration struct {
	DbConnectionString string
	JWTSecret          string
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
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
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

	// Create JWTAuth object
	auth := jwtauth.New("HS256", []byte(config.JWTSecret), nil)

	r.Use(jwtauth.Verifier(auth))
	r.Use(AddService(db, auth))

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	// In case somebody visits the root, show simple homepage
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Featmap"))
	})

	r.Route("/api", api)
	r.Route("/user-api", userApi)

	fmt.Println("Serving on port 3000")
	_ = http.ListenAndServe(":3000", r)
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
