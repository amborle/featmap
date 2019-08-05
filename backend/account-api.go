package backend

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
)

func accountAPI(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(RequireAccount())

		r.Get("/app", getApp)

		r.Route("/emailupdate/{EMAIL}", func(r chi.Router) {
			r.Post("/", updateEmail)
		})

		r.Post("/nameupdate", updateName)
		r.Post("/resend", resend)
		r.Post("/delete", deleteAccount)

		r.Post("/workspaces", createWorkspace)

	})
}

func getApp(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Account       *Account        `json:"account"`
		Workspaces    []*Workspace    `json:"workspaces"`
		Memberships   []*Member       `json:"memberships"`
		Subscriptions []*Subscription `json:"subscriptions"`
	}

	s := GetEnv(r).Service
	render.JSON(w, r, response{
		Account:       s.GetAccountObject(),
		Workspaces:    s.GetWorkspaces(),
		Memberships:   s.GetMembersByAccount(),
		Subscriptions: s.GetSubscriptionsByAccount(),
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

func deleteAccount(w http.ResponseWriter, r *http.Request) {

	s := GetEnv(r).Service
	err := s.DeleteAccount()
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

// Workspace
type createWorkspaceRequest struct {
	Name string `json:"name"`
}

func (p *createWorkspaceRequest) Bind(r *http.Request) error {
	return nil
}
func createWorkspace(w http.ResponseWriter, r *http.Request) {
	data := &createWorkspaceRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	s := GetEnv(r).Service
	workspace, _, _, err := s.CreateWorkspace(data.Name)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, workspace)
}
