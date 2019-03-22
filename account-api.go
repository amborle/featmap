package main

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
)

func accountAPI(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(RequireAccount())
		r.Route("/",
			func(r chi.Router) {
				r.Route("/emailupdate/{EMAIL}", func(r chi.Router) {
					r.Post("/", UpdateEmail)
				})

				r.Post("/resend", resend)
			})
	})
}

// UpdateEmail ...
func UpdateEmail(w http.ResponseWriter, r *http.Request) {
	key := chi.URLParam(r, "EMAIL")

	s := GetEnv(r).Service
	err := s.UpdateEmail(key)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	return
}

func resend(w http.ResponseWriter, r *http.Request) {

	s := GetEnv(r).Service
	err := s.ResendEmail()
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	return
}
