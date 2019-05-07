package main

import (
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"net/http"
)

func subscriptionApi(r chi.Router) {

	r.Post("/webhook", stripeWebhook)

	r.Group(func(r chi.Router) {
		r.Use(RequireOwner())
		r.Post("/checkoutsession", postCheckoutSession)
	})

}

func stripeWebhook(w http.ResponseWriter, r *http.Request) {
	err := GetEnv(r).Service.StripeWebhook(r)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	return
}

type getCheckoutSessionRequest struct {
	Plan     string `json:"plan"`
	Quantity int64  `json:"quantity"`
}

func (p *getCheckoutSessionRequest) Bind(r *http.Request) error {
	return nil
}

func postCheckoutSession(w http.ResponseWriter, r *http.Request) {

	data := &getCheckoutSessionRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	m, err := GetEnv(r).Service.GetSubscriptionPlanSession(data.Plan, data.Quantity)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
}
