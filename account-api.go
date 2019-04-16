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
					r.Post("/", updateEmail)
				})

				r.Route("/nameupdate", func(r chi.Router) {
					r.Post("/", updateName)
				})

				r.Post("/resend", resend)
			})
	})
}

func updateEmail(w http.ResponseWriter, r *http.Request) {
	key := chi.URLParam(r, "EMAIL")

	s := GetEnv(r).Service
	err := s.UpdateEmail(key)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	return
}

type updateNameRequest struct {
	Name string `json:"name"`
}

func (p *updateNameRequest) Bind(r *http.Request) error {
	return nil
}

func updateName(w http.ResponseWriter, r *http.Request) {
	data := &updateNameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	s := GetEnv(r).Service
	err := s.UpdateName(data.Name)
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
