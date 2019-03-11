package main

import (
	"log"
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/go-chi/jwtauth"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

// Service ...
type Service interface {
	GetMemberObject() *Member
	SetMemberObject(m *Member)

	GetAccountObject() *Account
	SetAccountObject(a *Account)

	Register(email string, password string, name string) (*Workspace, *Account, *Member, error)
	Login(email string, password string) (*Account, error)
	Token(accountID string) string
	GetWorkspace(id string) (*Workspace, error)
	GetAccount(accountID string) (*Account, error)

	GetMember(accountID string, workspaceID string) (*Member, error)

	GetProject(id string) *Project
	CreateProject(title string) (*Project, error)
	DeleteProject(id string) error
	GetProjects() []*Project

	CreateMilestoneWithID(id string, projectID string, title string) (*Milestone, error)
	GetMilestonesByProject(id string) []*Milestone
	DeleteMilestone(id string) error

	CreateWorkflowWithID(id string, projectID string, title string) (*Workflow, error)
	DeleteWorkflow(id string) error

	CreateSubWorkflowWithID(id string, workflowID string, title string) (*SubWorkflow, error)
	DeleteSubWorkflow(id string) error

	CreateFeatureWithID(id string, subWorkflowID string, milestoneID string, title string) (*Feature, error)
	DeleteFeature(id string) error
}

type service struct {
	Acc    *Account
	Member *Member
	r      Repository
	auth   *jwtauth.JWTAuth
}

// NewFeatmapService ...
func NewFeatmapService(account *Account, member *Member, repo Repository, auth *jwtauth.JWTAuth) Service {
	return &service{
		Acc:    account,
		Member: member,
		r:      repo,
		auth:   auth,
	}
}

func (s *service) GetMemberObject() *Member {
	return s.Member
}

func (s *service) SetMemberObject(m *Member) {
	s.Member = m
}

func (s *service) GetAccountObject() *Account {
	return s.Acc
}

func (s *service) SetAccountObject(a *Account) {
	s.Acc = a
}

func (s *service) Register(email string, password string, name string) (*Workspace, *Account, *Member, error) {

	email = govalidator.Trim(email, "")

	if !govalidator.IsEmail(email) {
		return nil, nil, nil, errors.New("email is invalid")
	}

	if len(name) < 3 {
		return nil, nil, nil, errors.New("name too short")
	}

	if len(password) < 8 {
		return nil, nil, nil, errors.New("password too short")
	}

	if len(password) > 200 {
		return nil, nil, nil, errors.New("password too long")
	}

	// First check if email is not already taken!
	dupacc, err := s.r.FindAccountByEmail(email)
	if dupacc != nil {
		return nil, nil, nil, errors.New("email already registrered")
	}

	dupworkspace, err := s.r.FindWorkspaceByName(name)
	if dupworkspace != nil {
		return nil, nil, nil, errors.New("name already registrered")
	}

	// Save workspace
	workspace := &Workspace{
		ID:        uuid.Must(uuid.NewV4(), nil).String(),
		Name:      name,
		CreatedAt: time.Now(),
	}

	t, err := s.r.SaveWorkspace(workspace)
	if err != nil {
		return nil, nil, nil, err
	}

	// Save account
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, nil, errors.Wrap(err, "hash could not be created when registering blag account")
	}
	usr := &Account{
		ID:        uuid.Must(uuid.NewV4(), nil).String(),
		Email:     email,
		Password:  string(hash),
		CreatedAt: time.Now(),
	}
	account, err := s.r.SaveAccount(usr)
	if err != nil {
		return nil, nil, nil, errors.Wrap(err, "account could note be saved")
	}

	// Save member
	member := &Member{
		ID:          uuid.Must(uuid.NewV4(), nil).String(),
		WorkspaceID: t.ID,
		AccountID:   account.ID,
	}
	_, err = s.r.SaveMember(member)
	if err != nil {
		return nil, nil, nil, errors.Wrap(err, "member could not be saved")
	}

	return workspace, account, member, nil
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

func (s *service) Token(accountID string) string {

	_, tokenString, _ := s.auth.Encode(jwtauth.Claims{"id": accountID})

	return tokenString
}

func (s *service) GetAccount(id string) (*Account, error) {

	account, err := s.r.FindAccount(id)
	if account == nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return account, nil
}

func (s *service) GetWorkspace(id string) (*Workspace, error) {

	workspace, err := s.r.FindWorkspace(id)
	if workspace == nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (s *service) GetMember(accountID string, workspaceID string) (*Member, error) {

	member, err := s.r.FindMemberByAccountAndWorkspace(accountID, workspaceID)
	if member == nil {
		return nil, errors.Wrap(err, "member not found")
	}
	return member, nil
}

// const datelayout = "2006-01-02"

// Projects

func (s *service) GetProject(id string) *Project {
	pp, err := s.r.FindProject(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return pp
}

func (s *service) CreateProject(title string) (*Project, error) {

	title = govalidator.Trim(title, "")
	if len(title) > 50 {
		return nil, errors.New("title too long")
	}

	if len(title) < 1 {
		return nil, errors.New("title too short")
	}

	p := &Project{
		WorkspaceID: s.Member.WorkspaceID,
		ID:          uuid.Must(uuid.NewV4(), nil).String(),
		Title:       title,
		CreatedBy:   s.Member.ID,
		CreatedAt:   time.Now()}

	p, err := s.r.StoreProject(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteProject(id string) error {
	return s.r.DeleteProject(s.Member.WorkspaceID, id)
}

func (s *service) GetProjects() []*Project {
	pp, err := s.r.FindProjectsByWorkspace(s.Member.WorkspaceID)
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
		WorkspaceID: s.Member.WorkspaceID,
		ProjectID:   projectID,
		ID:          id,
		Title:       title,
		Index:       "a",
		CreatedBy:   s.Member.ID,
		CreatedAt:   time.Now()}

	p, err := s.r.StoreMilestone(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteMilestone(id string) error {
	return s.r.DeleteMilestone(s.Member.WorkspaceID, id)
}

func (s *service) GetMilestonesByProject(id string) []*Milestone {
	pp, err := s.r.FindMilestonesByProject(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return pp
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
		WorkspaceID: s.Member.WorkspaceID,
		ProjectID:   projectID,
		ID:          id,
		Title:       title,
		Index:       "a",
		CreatedBy:   s.Member.ID,
		CreatedAt:   time.Now()}

	p, err := s.r.StoreWorkflow(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteWorkflow(id string) error {
	return s.r.DeleteWorkflow(s.Member.WorkspaceID, id)
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
		WorkspaceID: s.Member.WorkspaceID,
		WorkflowID:  workflowID,
		ID:          id,
		Title:       title,
		Index:       "a",
		CreatedBy:   s.Member.ID,
		CreatedAt:   time.Now()}

	p, err := s.r.StoreSubWorkflow(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteSubWorkflow(id string) error {
	return s.r.DeleteSubWorkflow(s.Member.WorkspaceID, id)
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
		WorkspaceID:   s.Member.WorkspaceID,
		MilestoneID:   milestoneID,
		SubWorkflowID: subWorkflowID,
		ID:            id,
		Title:         title,
		Index:         "a",
		CreatedBy:     s.Member.ID,
		CreatedAt:     time.Now()}

	p, err := s.r.StoreFeature(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteFeature(id string) error {
	return s.r.DeleteFeature(s.Member.WorkspaceID, id)
}
