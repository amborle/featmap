package main

import (
	"bytes"
	"github.com/amborle/featmap/tmpl"
	"html/template"
	"log"
	"net/smtp"
)

type welcome struct {
	AppSiteURL string
	Email      string
	Workspace  string
	Key        string
}

// WelcomeBody ...
func WelcomeBody(w welcome) (string, error) {

	data, err := tmpl.Asset("tmpl/welcome.tmpl")
	t, err := template.New("").Parse(string(data))
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

	data, err := tmpl.Asset("tmpl/email.tmpl")
	t, err := template.New("").Parse(string(data))
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	if err = t.Execute(buf, w); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func (s *service) SendEmail(smtpServer string, smtpPort string, smtpUser string, smtpPass string, from string, recipient string, subject string, body string) error {
	err := smtp.SendMail(smtpServer+":"+smtpPort,
		smtp.PlainAuth("", smtpUser, smtpPass, smtpServer),
		from, []string{recipient}, []byte("Subject:"+subject+"\r\n"+body))

	if err != nil {
		log.Printf("smtp error: %s", err)
		return err
	}

	return err
}

type resetPasswordBody struct {
	AppSiteURL string
	Email      string
	Key        string
}

// ResetPasswordBody ...
func ResetPasswordBody(w resetPasswordBody) (string, error) {

	data, err := tmpl.Asset("tmpl/reset.tmpl")
	t, err := template.New("").Parse(string(data))

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
	data, err := tmpl.Asset("tmpl/invite.tmpl")
	t, err := template.New("").Parse(string(data))
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	if err = t.Execute(buf, w); err != nil {
		return "", err
	}
	return buf.String(), nil
}
