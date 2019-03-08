package main

import (
	"github.com/go-chi/jwtauth"

	"net/http"

	"github.com/go-chi/chi"
)

func api(r chi.Router) {

	r.Group(func(r chi.Router) {
		r.Route("/",

			func(r chi.Router) {
				r.Use(jwtauth.Authenticator)

				r.Get("/", func(w http.ResponseWriter, r *http.Request) {

					w.Write([]byte("app api"))
				})

			})
	})
}
