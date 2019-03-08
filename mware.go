package main

import (
	"context"
	"net/http"

	"github.com/go-chi/jwtauth"
	"github.com/jmoiron/sqlx"
)

// Env ...
type Env struct {
	Service Service
}

// GetEnv ...
func GetEnv(r *http.Request) *Env {
	ctx := r.Context()
	env, _ := ctx.Value("env").(*Env)

	return env
}

// AddService ...
func AddService(db *sqlx.DB, auth *jwtauth.JWTAuth) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {

			s := NewFeatmapService(nil, NewFeatmapRepository(db), auth)

			_, claims, _ := jwtauth.FromContext(r.Context())
			tenantID, tok := claims.Get("tenantId")
			accountID, aok := claims.Get("accountId")

			var acc *Account
			if tok && aok {
				acc, _ = s.GetAccount(tenantID.(string), accountID.(string))
			}

			if acc != nil {
				s.AddAccount(acc)
			}

			env := &Env{Service: s}
			ctx := context.WithValue(r.Context(), "env", env)
			next.ServeHTTP(w, r.WithContext(ctx))

			// if acc == nil {
			// 	http.Error(w, http.StatusText(401), 401)
			// 	return
			// }

			// if !tok || !aok {
			// 	http.Error(w, http.StatusText(401), 401)
			// 	return
			// }
		}
		return http.HandlerFunc(fn)
	}
}
