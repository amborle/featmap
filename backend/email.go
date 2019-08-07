package main

import (
	"bytes"
	"context"
	"html/template"
	"time"
)

type welcome struct {
	AppSiteURL string
	Email      string
	Workspace  string
	Key        string
}

// WelcomeBody ...
func WelcomeBody(w welcome) (string, error) {

	t, err := template.ParseFiles("./tmpl/welcome.tmpl")
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	if err = t.Execute(buf, w); err != nil {
		return "", err
	}
	return buf.String(), nil
}

type emailBody struct {
	AppSiteURL string
	Email      string
	Key        string
}

// ChangeEmailBody ...
func ChangeEmailBody(w emailBody) (string, error) {

	t, err := template.ParseFiles("./tmpl/email.tmpl")
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	if err = t.Execute(buf, w); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func (s *service) SendEmail(from string, recipient string, subject string, body string) error {

	message := s.mg.NewMessage(from, subject, body, recipient)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	_, _, err := s.mg.Send(ctx, message)
	return err
}

type resetPasswordBody struct {
	AppSiteURL string
	Email      string
	Key        string
}

// ResetPasswordBody ...
func ResetPasswordBody(w resetPasswordBody) (string, error) {

	t, err := template.ParseFiles("./tmpl/reset.tmpl")
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	if err = t.Execute(buf, w); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// InviteStruct ...
type InviteStruct struct {
	AppSiteURL     string
	Email          string
	WorkspaceName  string
	Code           string
	InvitedBy      string
	InvitedByEmail string
}

func inviteBody(w InviteStruct) (string, error) {

	t, err := template.ParseFiles("./tmpl/invite.tmpl")
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	if err = t.Execute(buf, w); err != nil {
		return "", err
	}
	return buf.String(), nil
}
