package main

import (
	"log"
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/go-chi/jwtauth"
	"github.com/pkg/errors"
	"github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

// Service ...
type Service interface {
	AddAccount(acc *Account)
	Register(email string, password string) (*Account, error)
	Login(email string, password string) (*Account, error)
	Token(account *Account) string
	GetAccount(tenantID string, accountID string) (*Account, error)

	GetProjects() []*Project
	CreateProject(title string) (*Project, error)
	DeleteProject(id string) error

	CreateMilestoneWithID(id string, projectID string, title string) (*Milestone, error)
	DeleteMilestone(id string) error

	CreateWorkflowWithID(id string, projectID string, title string) (*Workflow, error)
	DeleteWorkflow(id string) error

	CreateSubWorkflowWithID(id string, workflowID string, title string) (*SubWorkflow, error)
	DeleteSubWorkflow(id string) error

	CreateFeatureWithID(id string, subWorkflowID string, milestoneID string, title string) (*Feature, error)
	DeleteFeature(id string) error
}

type service struct {
	acc  *Account
	r    Repository
	auth *jwtauth.JWTAuth
}

// NewFeatmapService ...
func NewFeatmapService(account *Account, repo Repository, auth *jwtauth.JWTAuth) Service {
	return &service{
		acc:  account,
		r:    repo,
		auth: auth,
	}
}

func (s *service) AddAccount(acc *Account) {
	s.acc = acc
}

func (s *service) Register(email string, password string) (*Account, error) {

	email = govalidator.Trim(email, "")

	if !govalidator.IsEmail(email) {
		return nil, errors.New("email is invalid")
	}

	if len(password) < 8 {
		return nil, errors.New("password too short")
	}

	if len(password) > 200 {
		return nil, errors.New("password too long")
	}

	// First check if email is not already taken!
	dupacc, err := s.r.FindAccountByEmail(email)
	if dupacc != nil {
		return nil, errors.New("email already taken")
	}

	// Create a blag tenant
	t, err := s.r.StoreTenant(&Tenant{ID: ""})
	if err != nil {
		return nil, err
	}

	// Create a blag password hash
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.Wrap(err, "hash could not be created when registering blag account")
	}

	usr := &Account{
		TenantID: t.ID,
		ID:       uuid.Must(uuid.NewV4(), nil).String(),
		Email:    email,
		Password: string(hash),
	}

	// Create a blag account for the newly created tenant
	account, err := s.r.StoreAccount(usr)
	if err != nil {
		return nil, errors.Wrap(err, "account could note be stored")
	}

	return account, nil
}

func (s *service) Login(email string, password string) (*Account, error) {

	acc, err := s.r.FindAccountByEmail(email)
	if acc == nil {
		return nil, errors.Wrap(err, "email not found")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(acc.Password), []byte(password)); err != nil {
		return nil, errors.Wrap(err, "password not correct")
	}

	return acc, nil
}

func (s *service) Token(account *Account) string {

	_, tokenString, _ := s.auth.Encode(jwtauth.Claims{"tenantId": account.TenantID, "accountId": account.ID, "email": account.Email})

	return tokenString
}

func (s *service) GetAccount(tid string, accid string) (*Account, error) {

	account, err := s.r.FindAccount(tid, accid)
	if account == nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return account, nil
}

// const datelayout = "2006-01-02"

// Projects

func (s *service) CreateProject(title string) (*Project, error) {

	title = govalidator.Trim(title, "")
	if len(title) > 50 {
		return nil, errors.New("title too long")
	}

	if len(title) < 1 {
		return nil, errors.New("title too short")
	}

	p := &Project{
		TenantID:  s.acc.TenantID,
		ID:        uuid.Must(uuid.NewV4(), nil).String(),
		Title:     title,
		CreatedBy: s.acc.ID,
		CreatedAt: time.Now()}

	p, err := s.r.StoreProject(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteProject(id string) error {
	return s.r.DeleteProject(s.acc.TenantID, id)
}

func (s *service) GetProjects() []*Project {
	pp, err := s.r.FindProjectsByTenant(s.acc.TenantID)
	if err != nil {
		log.Println(err)
	}
	return pp
}

// Milestones

func (s *service) CreateMilestoneWithID(id string, projectID string, title string) (*Milestone, error) {

	title = govalidator.Trim(title, "")
	if len(title) > 50 {
		return nil, errors.New("title too long")
	}

	if len(title) < 1 {
		return nil, errors.New("title too short")
	}

	p := &Milestone{
		TenantID:  s.acc.TenantID,
		ProjectID: projectID,
		ID:        id,
		Title:     title,
		Index:     1000,
		CreatedBy: s.acc.ID,
		CreatedAt: time.Now()}

	p, err := s.r.StoreMilestone(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteMilestone(id string) error {
	return s.r.DeleteMilestone(s.acc.TenantID, id)
}

// Workflow

func (s *service) CreateWorkflowWithID(id string, projectID string, title string) (*Workflow, error) {

	title = govalidator.Trim(title, "")
	if len(title) > 50 {
		return nil, errors.New("title too long")
	}

	if len(title) < 1 {
		return nil, errors.New("title too short")
	}

	p := &Workflow{
		TenantID:  s.acc.TenantID,
		ProjectID: projectID,
		ID:        id,
		Title:     title,
		Index:     1000,
		CreatedBy: s.acc.ID,
		CreatedAt: time.Now()}

	p, err := s.r.StoreWorkflow(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteWorkflow(id string) error {
	return s.r.DeleteWorkflow(s.acc.TenantID, id)
}

// SubWorkflow
func (s *service) CreateSubWorkflowWithID(id string, workflowID string, title string) (*SubWorkflow, error) {

	title = govalidator.Trim(title, "")
	if len(title) > 50 {
		return nil, errors.New("title too long")
	}

	if len(title) < 1 {
		return nil, errors.New("title too short")
	}

	p := &SubWorkflow{
		TenantID:   s.acc.TenantID,
		WorkflowID: workflowID,
		ID:         id,
		Title:      title,
		Index:      1000,
		CreatedBy:  s.acc.ID,
		CreatedAt:  time.Now()}

	p, err := s.r.StoreSubWorkflow(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteSubWorkflow(id string) error {
	return s.r.DeleteSubWorkflow(s.acc.TenantID, id)
}

// Features

func (s *service) CreateFeatureWithID(id string, subWorkflowID string, milestoneID string, title string) (*Feature, error) {

	title = govalidator.Trim(title, "")
	if len(title) > 50 {
		return nil, errors.New("title too long")
	}

	if len(title) < 1 {
		return nil, errors.New("title too short")
	}

	p := &Feature{
		TenantID:      s.acc.TenantID,
		MilestoneID:   milestoneID,
		SubWorkflowID: subWorkflowID,
		ID:            id,
		Title:         title,
		Index:         1000,
		CreatedBy:     s.acc.ID,
		CreatedAt:     time.Now()}

	p, err := s.r.StoreFeature(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteFeature(id string) error {
	return s.r.DeleteFeature(s.acc.TenantID, id)
}
