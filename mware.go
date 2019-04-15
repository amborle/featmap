package main

import (
	"context"
	"log"
	"net/http"

	"github.com/go-chi/jwtauth"
	"github.com/jmoiron/sqlx"
	"github.com/mailgun/mailgun-go/v3"
)

// Env ...
type Env struct {
	Service Service
}

// GetEnv ...
func GetEnv(r *http.Request) *Env {
	ctx := r.Context()
	env, _ := ctx.Value(contextKey).(*Env)

	return env
}

type key int

const contextKey key = 0

// AddService ...
func AddService(appSiteURL string, db *sqlx.DB, auth *jwtauth.JWTAuth, mg *mailgun.MailgunImpl) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := NewFeatmapService(appSiteURL, nil, nil, NewFeatmapRepository(db), auth, mg)

			_, claims, _ := jwtauth.FromContext(r.Context())

			accountID, aok := claims.Get("id")

			var acc *Account
			if aok {
				acc, _ = s.GetAccount(accountID.(string))
				s.SetAccountObject(acc)
			}

			if acc != nil {

				if val, ok := r.Header["Workspace"]; ok {

					member, err := s.GetMember(acc.ID, val[0])
					if err != nil {
						log.Println(err)
					}
					s.SetMemberObject(member)
				}
			}

			ctx := context.WithValue(r.Context(), contextKey, &Env{Service: s})
			next.ServeHTTP(w, r.WithContext(ctx))
		}
		return http.HandlerFunc(fn)
	}
}

// RequireMember ...
func RequireMember() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			if GetEnv(r).Service.GetMemberObject() == nil {
				http.Error(w, http.StatusText(401), 401)
				return
			}
			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

// RequireAdmin ...
func RequireAdmin() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			if !(GetEnv(r).Service.GetMemberObject().Level == "ADMIN" || GetEnv(r).Service.GetMemberObject().Level == "OWNER") {
				http.Error(w, http.StatusText(401), 401)
				return
			}
			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

// RequireAccount ...
func RequireAccount() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			if GetEnv(r).Service.GetAccountObject() == nil {
				http.Error(w, http.StatusText(401), 401)
				return
			}
			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

// RequireEditor ...
func RequireEditor() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			if !(GetEnv(r).Service.GetMemberObject().Level == "EDITOR" || GetEnv(r).Service.GetMemberObject().Level == "ADMIN" || GetEnv(r).Service.GetMemberObject().Level == "OWNER") {
				http.Error(w, http.StatusText(401), 401)
				return
			}
			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}
