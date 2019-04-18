package main

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/pkg/errors"
)

func linkAPI(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Route("/{LINK}",
			func(r chi.Router) {
				r.Get("/", getLink)
			})
	})
}

// getLink ...
func getLink(w http.ResponseWriter, r *http.Request) {
	link := chi.URLParam(r, "LINK")
	s := GetEnv(r).Service

	project, err := s.GetProjectByExternalLink(link)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(errors.New("not found")))
		return
	}
	render.JSON(w, r, project)
}
