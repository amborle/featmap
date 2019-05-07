package main

import (
	"encoding/json"
	"github.com/davecgh/go-spew/spew"
	"github.com/pkg/errors"
	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/checkout/session"
	"github.com/stripe/stripe-go/sub"
	"github.com/stripe/stripe-go/webhook"
	"io/ioutil"
	"net/http"
	"time"
)

func (s *service) StripeWebhook(r *http.Request) error {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return err
	}

	endpointSecret := s.config.StripeWebhookSecret
	event, err := webhook.ConstructEvent(body, r.Header.Get("Stripe-Signature"),
		endpointSecret)

	if err != nil {
		return err
	}

	stripe.Key = s.config.StripeKey

	switch event.Type {
	case "checkout.session.completed":
		var ses stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &ses)
		if err != nil {
			return err
		}
		err = s.handleCheckoutSession(&ses)
		if err != nil {
			return err
		}

	default:
		return errors.New("unexpected event type")
	}

	return nil
}

func (s *service) handleCheckoutSession(ses *stripe.CheckoutSession) error {

	featmapSub := s.GetSubscriptionByWorkspace(ses.ClientReferenceID)
	if featmapSub == nil {
		return errors.New("subscription not found")
	}

	stripe.Key = s.config.StripeKey
	stripeSub, _ := sub.Get(ses.Subscription.ID, nil)
	spew.Dump(stripeSub)

	featmapSub.FromDate = time.Unix(stripeSub.CurrentPeriodStart, 0).UTC()
	featmapSub.ExpirationDate = time.Unix(stripeSub.CurrentPeriodEnd, 0).UTC()
	featmapSub.ExternalCustomerID = stripeSub.Customer.ID
	featmapSub.ExternalStatus = string(stripeSub.Status)
	featmapSub.ExternalPlanID = stripeSub.Plan.ID
	featmapSub.NumberOfEditors = int(stripeSub.Quantity)

	s.r.StoreSubscription(featmapSub)

	return nil
}

func (s *service) GetSubscriptionPlanSession(plan string, quantity int64) (string, error) {

	var stripePlan string
	switch plan {
	case "pro":
		stripePlan = s.config.StripeProPlan
	case "basic":
		stripePlan = s.config.StripeBasicPlan
	default:
		return "", errors.New("invalid plan")
	}

	if quantity < 0 || quantity > 1000 {
		return "", errors.New("invalid quantity")
	}

	sub := s.GetSubscriptionByWorkspace(s.ws.ID)

	switch sub.ExternalStatus {
	case "incomplete_expired", "incomplete", "trialing", "canceled":
		break
	default:
		return "", errors.New("already have active subscription")
	}

	stripe.Key = s.config.StripeKey

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Items: []*stripe.CheckoutSessionSubscriptionDataItemsParams{
				&stripe.CheckoutSessionSubscriptionDataItemsParams{
					Plan:     stripe.String(stripePlan),
					Quantity: stripe.Int64(quantity),
				},
			},
		},
		SuccessURL:        stripe.String("https://app.featmap.com/account/success"),
		CancelURL:         stripe.String("https://app.featmap.com/account/cancel"),
		ClientReferenceID: stripe.String(s.ws.ID),
		CustomerEmail:     stripe.String(s.Acc.Email),
	}

	ses, err := session.New(params)
	if err != nil {
		return "", errors.New("session error ")
	}

	return ses.ID, nil
}
