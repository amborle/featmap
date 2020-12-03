package main

import (
	"context"
	"log"
	"net/http"

	"github.com/go-chi/jwtauth"
	"github.com/go-chi/render"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
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

// ContextSkeleton ...
func ContextSkeleton(c Configuration) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := NewFeatmapService()
			s.SetConfig(c)
			ctx := context.WithValue(r.Context(), contextKey, &Env{Service: s})
			next.ServeHTTP(w, r.WithContext(ctx))
		}
		return http.HandlerFunc(fn)
	}
}

// Transaction ...
func Transaction(db *sqlx.DB) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := GetEnv(r).Service

			_ = txnDo(db, func(tx *sqlx.Tx) error {
				repo := NewFeatmapRepository(db)
				repo.SetTx(tx)
				s.SetRepoObject(repo)
				next.ServeHTTP(w, r)
				return nil
			})

		}
		return http.HandlerFunc(fn)
	}
}

// Auth ...
func Auth(auth *jwtauth.JWTAuth) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			s := GetEnv(r).Service
			s.SetAuth(auth)
			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

// User ...
func User() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := GetEnv(r).Service
			_, claims, _ := jwtauth.FromContext(r.Context())
			accountID, aok := claims["id"]

			var acc *Account
			if aok {
				acc, _ = s.GetAccount(accountID.(string))
				s.SetAccountObject(acc)
			}

			if acc != nil {

				if val, ok := r.Header["Workspace"]; ok {

					member, err := s.GetMember(acc.ID, val[0])
					if err != nil {
						http.Error(w, http.StatusText(401), 401)
						return
					}
					s.SetMemberObject(member)

					ws, err := s.GetWorkspace(val[0])
					if err != nil {
						http.Error(w, http.StatusText(401), 401)
						return
					}
					s.SetWorkspaceObject(ws)

					sub := s.GetSubscriptionByWorkspace(member.WorkspaceID)
					if sub == nil {
						http.Error(w, http.StatusText(401), 401)
						return
					}
					s.SetSubscriptionObject(sub)
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

// RequireOwner ...
func RequireOwner() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			if !(GetEnv(r).Service.GetMemberObject().Level == "OWNER") {
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

// RequireSubscription  ...
func RequireSubscription() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := GetEnv(r).Service.GetSubscriptionObject()

			if !subscriptionIsActive(s) {
				http.Error(w, http.StatusText(401), 401)
				return
			}
			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

func subscriptionIsActive(s *Subscription) bool {
	switch s.Status {

	case "active":
		return true
	case "incomplete", "incomplete_expired", "past_due", "canceled":
		return false
	case "trialing":
		if subHasExpired(s) {
			return false
		}
		return true
	}
	return false
}

// RequireTrialOrPro  ...
func RequireTrialOrPro() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := GetEnv(r).Service.GetSubscriptionObject()

			log.Println("level " + s.Level)

			switch s.Level {

			case "PRO", "TRIAL":
				break
			default:
				return
			}

			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

func requireChangeableSubscription() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := GetEnv(r).Service.GetSubscriptionObject()

			switch s.Status {
			case "active", "past_due":
				break
			default:
				http.Error(w, http.StatusText(401), 401)
				return
			}

			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

func requireDeleteableWorkspace() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := GetEnv(r).Service.GetSubscriptionObject()

			switch s.Status {
			case "active", "past_due":
				_ = render.Render(w, r, ErrInvalidRequest(errors.New("cannot delete workspace with an active subscription - cancel subscription first")))
				return
			default:
			}

			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}
