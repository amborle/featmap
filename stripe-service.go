package main

import (
	"encoding/json"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
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

	case "customer.subscription.updated":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			return err
		}
		err = s.handleSubscriptionUpdate(&subscription)
		if err != nil {
			return err
		}

	case "customer.subscription.deleted":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			return err
		}
		err = s.handleSubscriptionUpdate(&subscription)
		if err != nil {
			return err
		}

	default:
		return errors.New("unexpected event type")
	}

	return nil
}

func (s *service) externalPlanToTier(plan string) string {

	if s.config.StripeBasicPlan == plan {
		return "BASIC"
	}

	if s.config.StripeProPlan == plan {
		return "PRO"
	}
	return ""
}

func (s *service) handleCheckoutSession(ses *stripe.CheckoutSession) error {

	workspace, err := s.GetWorkspace(ses.ClientReferenceID)
	if err != nil {
		return errors.New("workspace not found")
	}

	stripeSub, _ := sub.Get(ses.Subscription.ID, nil)

	newSubscription := &Subscription{
		WorkspaceID:                ses.ClientReferenceID,
		ID:                         uuid.Must(uuid.NewV4(), nil).String(),
		Level:                      s.externalPlanToTier(stripeSub.Plan.ID),
		NumberOfEditors:            int(stripeSub.Quantity),
		FromDate:                   time.Unix(stripeSub.CurrentPeriodStart, 0).UTC(),
		ExpirationDate:             time.Unix(stripeSub.CurrentPeriodEnd, 0).UTC(),
		CreatedByName:              "system",
		CreatedAt:                  time.Unix(stripeSub.CurrentPeriodStart, 0).UTC(),
		LastModified:               time.Unix(stripeSub.CurrentPeriodStart, 0).UTC(),
		LastModifiedByName:         "system",
		ExternalCustomerID:         stripeSub.Customer.ID,
		ExternalPlanID:             stripeSub.Plan.ID,
		ExternalSubscriptionID:     stripeSub.ID,
		ExternalStatus:             string(stripeSub.Status),
		ExternalSubscriptionItemID: stripeSub.Items.Data[0].ID,
	}

	s.r.StoreSubscription(newSubscription)
	workspace.ExternalCustomerID = stripeSub.Customer.ID
	workspace.ExternalBillingEmail = ses.CustomerEmail

	s.r.StoreWorkspace(workspace)

	return nil
}

func (s *service) handleSubscriptionUpdate(subscription *stripe.Subscription) error {

	localSub, err := s.r.FindSubscriptionByExernalID(subscription.ID)
	if err != nil {
		return err
	}

	localSub.Level = s.externalPlanToTier(subscription.Plan.ID)
	localSub.NumberOfEditors = int(subscription.Quantity)
	localSub.FromDate = time.Unix(subscription.CurrentPeriodStart, 0).UTC()
	localSub.ExpirationDate = time.Unix(subscription.CurrentPeriodEnd, 0).UTC()
	localSub.LastModified = time.Unix(subscription.CurrentPeriodStart, 0).UTC()
	localSub.ExternalPlanID = subscription.Plan.ID
	localSub.ExternalStatus = string(subscription.Status)
	localSub.ExternalSubscriptionItemID = subscription.Items.Data[0].ID

	s.r.StoreSubscription(localSub)

	return nil
}

func (s *service) handleCancelSubscription() error {
	localSub := s.Subscription

	_, err := sub.Cancel(localSub.ExternalSubscriptionID, nil)
	if err != nil {
		return err
	}

	localSub.ExternalStatus = "canceled"

	s.r.StoreSubscription(localSub)

	return nil
}

func (s *service) handleChangeSubscription(externalPlanID string, quantity int64) error {

	if quantity < 0 || quantity > 1000 {
		return errors.New("invalid quantity")
	}

	if int(quantity) < s.numberOfEditors() {
		return errors.New("quantity must not be less than the current number of editors ")
	}

	localSub := s.Subscription

	params := &stripe.SubscriptionParams{
		Items: []*stripe.SubscriptionItemsParams{
			{ID: stripe.String(localSub.ExternalSubscriptionItemID), Plan: stripe.String(externalPlanID), Quantity: stripe.Int64(quantity)},
		},
		Prorate: stripe.Bool(true),
	}

	externalSub, err := sub.Update(localSub.ExternalSubscriptionID, params)
	if err != nil {
		return err
	}

	localSub.Level = s.externalPlanToTier(externalSub.Plan.ID)
	localSub.NumberOfEditors = int(externalSub.Quantity)
	localSub.FromDate = time.Unix(externalSub.CurrentPeriodStart, 0).UTC()
	localSub.ExpirationDate = time.Unix(externalSub.CurrentPeriodEnd, 0).UTC()
	localSub.CreatedByName = "system"
	localSub.CreatedAt = time.Unix(externalSub.CurrentPeriodStart, 0).UTC()
	localSub.LastModified = time.Unix(externalSub.CurrentPeriodStart, 0).UTC()
	localSub.LastModifiedByName = "system"
	localSub.ExternalCustomerID = externalSub.Customer.ID
	localSub.ExternalPlanID = externalSub.Plan.ID
	localSub.ExternalSubscriptionID = externalSub.ID
	localSub.ExternalStatus = string(externalSub.Status)
	localSub.ExternalSubscriptionItemID = externalSub.Items.Data[0].ID

	s.r.StoreSubscription(localSub)

	return nil
}

func (s *service) ChangeSubscription(plan string, quantity int64) error {

	switch plan {
	case "pro":
		return s.handleChangeSubscription(s.config.StripeProPlan, quantity)
	case "basic":
		return s.handleChangeSubscription(s.config.StripeBasicPlan, quantity)
	case "cancel":
		return s.handleCancelSubscription()
	default:
		return errors.New("invalid plan/action")
	}

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

	if int(quantity) < s.numberOfEditors() {
		return "", errors.New("quantity must not be less than the current number of editors ")
	}

	subscription := s.GetSubscriptionByWorkspace(s.ws.ID)

	switch subscription.ExternalStatus {
	case "incomplete_expired", "incomplete", "trialing", "canceled":
		break
	default:
		return "", errors.New("already have active subscription")
	}

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
		SuccessURL:        stripe.String(s.config.AppSiteURL + "account/success"),
		CancelURL:         stripe.String(s.config.AppSiteURL + "account/cancel"),
		ClientReferenceID: stripe.String(s.ws.ID),
		CustomerEmail:     stripe.String(s.ws.ExternalBillingEmail),
		// Customer:          stripe.String(s.ws.ExternalCustomerID),
	}

	ses, err := session.New(params)
	if err != nil {
		return "", errors.New("session error ")
	}

	return ses.ID, nil
}
