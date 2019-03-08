package main

import (
	"github.com/go-chi/render"
	"github.com/pkg/errors"
	"net/http"

	"github.com/go-chi/chi"
)

func userApi(r chi.Router) {

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

	// Check email and password
	acc, err := GetEnv(r).Service.Login(data.Email, data.Password)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(errors.New("email or password is incorrect")))
		return
	}

	// Return token
	token := GetEnv(r).Service.Token(acc)

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

	acc, err := GetEnv(r).Service.Register(data.Email, data.Password)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(errors.Wrap(err, "could not register user")))
		return
	}

	token := GetEnv(r).Service.Token(acc)
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
