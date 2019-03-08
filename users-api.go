package main

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/pkg/errors"

	"github.com/go-chi/chi"
)

func usersAPI(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Route("/",
			func(r chi.Router) {
				r.Post("/signup", UsersSignup)
				r.Post("/login", UsersLogin)
			})
	})
}

// UsersLogin ...
func UsersLogin(w http.ResponseWriter, r *http.Request) {
	data := &LoginRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	s := GetEnv(r).Service
	// Check email and password
	acc, err := s.Login(data.Email, data.Password)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(errors.New("email or password is incorrect")))
		return
	}

	// Return token
	token := s.Token(acc.ID)

	render.Status(r, http.StatusOK)
	_ = render.Render(w, r, &TokenResponse{Token: token})
}

// UsersSignup ...
func UsersSignup(w http.ResponseWriter, r *http.Request) {
	data := &SignupRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	s := GetEnv(r).Service

	_, acc, _, err := s.Register(data.Email, data.Password, data.Name)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(errors.Wrap(err, "could not register user")))
		return
	}

	token := s.Token(acc.ID)
	render.Status(r, http.StatusOK)
	_ = render.Render(w, r, &TokenResponse{Token: token})
}

// LoginRequest ...
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Bind ...
func (p *LoginRequest) Bind(r *http.Request) error {
	return nil
}

// SignupRequest ...
type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

// Bind ...
func (p *SignupRequest) Bind(r *http.Request) error {
	return nil
}

// TokenResponse  ...
type TokenResponse struct {
	Token string `json:"token"`
}

// Render ...
func (rd *TokenResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}
