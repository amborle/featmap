package main

import (
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/pkg/errors"
)

func usersAPI(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Route("/",
			func(r chi.Router) {
				r.Post("/signup", UsersSignup)
				r.Post("/logout", UsersLogout)
				r.Post("/login", UsersLogin)
				r.Post("/verify", VerifyEmail)
				r.Route("/verify/{KEY}", func(r chi.Router) {
					r.Post("/", VerifyEmail)
				})
				r.Route("/reset/{EMAIL}", func(r chi.Router) {
					r.Post("/", ResetEmail)
				})
				r.Route("/setpassword", func(r chi.Router) {
					r.Post("/", SetPassword)
				})

				r.Route("/invite/{CODE}", func(r chi.Router) {
					r.Get("/", getInvite)
					r.Post("/", acceptInvite)
				})
				r.Post("/contact", contact)
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
	addCookie(w, "jwt", token)

	type response struct {
		Token string `json:"token"`
	}
	render.JSON(w, r, &response{Token: token})
}

// UsersLogout ...
func UsersLogout(w http.ResponseWriter, r *http.Request) {
	deleteCookie(w, "jwt")
	render.Status(r, http.StatusOK)
}

// UsersSignup ...
func UsersSignup(w http.ResponseWriter, r *http.Request) {
	data := &SignupRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	s := GetEnv(r).Service

	_, acc, _, err := s.Register(data.WorkspaceName, data.Name, data.Email, data.Password)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	token := s.Token(acc.ID)

	addCookie(w, "jwt", token)

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
	WorkspaceName string `json:"workspaceName"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	Password      string `json:"password"`
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

func addCookie(w http.ResponseWriter, name string, value string) {
	expire := time.Now().UTC().AddDate(10, 0, 0)
	cookie := http.Cookie{
		Name:    name,
		Value:   value,
		Expires: expire,
		Path:    "/",
		// Domain:  "false",
	}
	http.SetCookie(w, &cookie)
}

func deleteCookie(w http.ResponseWriter, name string) {
	cookie := http.Cookie{
		Name:   name,
		MaxAge: -1,
		Path:   "/",
	}
	http.SetCookie(w, &cookie)
}

// VerifyEmail ...
func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	key := chi.URLParam(r, "KEY")

	s := GetEnv(r).Service
	err := s.ConfirmEmail(key)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	return
}

// ResetEmail ...
func ResetEmail(w http.ResponseWriter, r *http.Request) {
	email := chi.URLParam(r, "EMAIL")

	s := GetEnv(r).Service
	err := s.SendResetEmail(email)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	return
}

// SetPasswordRequest ...
type SetPasswordRequest struct {
	Key      string `json:"key"`
	Password string `json:"password"`
}

// Bind ...
func (p *SetPasswordRequest) Bind(r *http.Request) error {
	return nil
}

// SetPassword ...
func SetPassword(w http.ResponseWriter, r *http.Request) {

	data := &SetPasswordRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	err := GetEnv(r).Service.SetPassword(data.Password, data.Key)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	type response struct {
		message string
	}

	return
}

func getInvite(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "CODE")

	invite, err := GetEnv(r).Service.GetInvite(code)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, invite)
}

func acceptInvite(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "CODE")

	err := GetEnv(r).Service.AcceptInvite(code)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	return
}

// ContactRequest ...
type ContactRequest struct {
	Topic      string `json:"topic"`
	Body string `json:"body"` 
	Sender string `json:"sender"` 
}

// Bind ...
func (p *ContactRequest) Bind(r *http.Request) error {
	return nil
}

func contact(w http.ResponseWriter, r *http.Request) {
	data :=   &ContactRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	} 
	
	err := GetEnv(r).Service.Contact(data.Topic,data.Body,data.Sender)  
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	return
}
