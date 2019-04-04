package main

import (
	"log"
	"time"

	"github.com/amborle/featmap/lexorank"

	"github.com/asaskevich/govalidator"
	"github.com/go-chi/jwtauth"
	"github.com/mailgun/mailgun-go/v3"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

// Service ...
type Service interface {
	GetMemberObject() *Member
	SetMemberObject(m *Member)
	SendEmail(recipient string, subject string, body string) error

	GetAccountObject() *Account
	SetAccountObject(a *Account)

	Register(workspaceName string, name string, email string, password string) (*Workspace, *Account, *Member, error)
	Login(email string, password string) (*Account, error)
	Token(accountID string) string
	GetWorkspace(id string) (*Workspace, error)
	GetWorkspaceByContext() *Workspace
	GetWorkspaces() []*Workspace
	GetAccount(accountID string) (*Account, error)
	ConfirmEmail(key string) error
	UpdateEmail(email string) error
	UpdateName(name string) error
	ResendEmail() error
	SendResetEmail(email string) error
	SetPassword(password string, key string) error

	GetMember(accountID string, workspaceID string) (*Member, error)
	GetMembers() []*Member

	GetProject(id string) *Project
	CreateProjectWithID(id string, title string) (*Project, error)
	RenameProject(id string, title string) (*Project, error)
	DeleteProject(id string) error
	GetProjects() []*Project

	CreateMilestoneWithID(id string, projectID string, title string) (*Milestone, error)
	MoveMilestone(id string, index int) (*Milestone, error)
	RenameMilestone(id string, title string) (*Milestone, error)
	GetMilestonesByProject(id string) []*Milestone
	DeleteMilestone(id string) error

	GetWorkflowsByProject(id string) []*Workflow
	MoveWorkflow(id string, index int) (*Workflow, error)
	CreateWorkflowWithID(id string, projectID string, title string) (*Workflow, error)
	RenameWorkflow(id string, title string) (*Workflow, error)
	DeleteWorkflow(id string) error

	CreateSubWorkflowWithID(id string, workflowID string, title string) (*SubWorkflow, error)
	MoveSubWorkflow(id string, toWorkflowID string, index int) (*SubWorkflow, error)
	GetSubWorkflowsByProject(id string) []*SubWorkflow
	RenameSubWorkflow(id string, title string) (*SubWorkflow, error)
	DeleteSubWorkflow(id string) error

	GetFeaturesByProject(id string) []*Feature
	MoveFeature(id string, toMilestoneID string, toSubWorkflowID string, index int) (*Feature, error)
	CreateFeatureWithID(id string, subWorkflowID string, milestoneID string, title string) (*Feature, error)
	RenameFeature(id string, title string) (*Feature, error)
	DeleteFeature(id string) error
}

type service struct {
	appSiteURL string
	Acc        *Account
	Member     *Member
	r          Repository
	auth       *jwtauth.JWTAuth
	mg         *mailgun.MailgunImpl
}

// NewFeatmapService ...
func NewFeatmapService(appSiteURL string, account *Account, member *Member, repo Repository, auth *jwtauth.JWTAuth, mg *mailgun.MailgunImpl) Service {
	return &service{
		appSiteURL: appSiteURL,
		Acc:        account,
		Member:     member,
		r:          repo,
		auth:       auth,
		mg:         mg,
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

func (s *service) Register(workspaceName string, name string, email string, password string) (*Workspace, *Account, *Member, error) {

	workspaceName = govalidator.Trim(workspaceName, "")
	name = govalidator.Trim(name, "")
	email = govalidator.Trim(email, "")

	if !govalidator.IsEmail(email) {
		return nil, nil, nil, errors.New("email_invalid")
	}

	if len(workspaceName) < 2 || len(workspaceName) > 200 || !govalidator.IsAlphanumeric(workspaceName) || workspaceName == "account" {
		return nil, nil, nil, errors.New("workspace_invalid")
	}

	if len(name) < 1 || len(name) > 200 {
		return nil, nil, nil, errors.New("name_invalid")
	}

	if len(password) < 6 || len(password) > 200 {
		return nil, nil, nil, errors.New("password_invalid")
	}

	// First check if email is not already taken!
	dupacc, err := s.r.GetAccountByEmail(email)
	if dupacc != nil {
		return nil, nil, nil, errors.New("email_taken")
	}

	dupworkspace, err := s.r.GetWorkspaceByName(workspaceName)
	if dupworkspace != nil {
		return nil, nil, nil, errors.New("workspace_taken")
	}

	// Save workspace
	workspace := &Workspace{
		ID:        uuid.Must(uuid.NewV4(), nil).String(),
		Name:      workspaceName,
		CreatedAt: time.Now(),
	}

	t, err := s.r.SaveWorkspace(workspace)
	if err != nil {
		return nil, nil, nil, err
	}

	// Save account
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, nil, err
	}
	usr := &Account{
		ID:                       uuid.Must(uuid.NewV4(), nil).String(),
		Name:                     name,
		Email:                    email,
		Password:                 string(hash),
		CreatedAt:                time.Now(),
		EmailConfirmationSentTo:  email,
		EmailConfirmed:           false,
		EmailConfirmationKey:     uuid.Must(uuid.NewV4(), nil).String(),
		EmailConfirmationPending: true,
		PasswordResetKey:         uuid.Must(uuid.NewV4(), nil).String(),
	}
	account, err := s.r.SaveAccount(usr)
	if err != nil {
		return nil, nil, nil, err
	}

	// Save member
	member := &Member{
		ID:          uuid.Must(uuid.NewV4(), nil).String(),
		WorkspaceID: t.ID,
		AccountID:   account.ID,
	}
	_, err = s.r.SaveMember(member)
	if err != nil {
		return nil, nil, nil, err
	}

	body, err := WelcomeBody(welcome{s.appSiteURL, usr.EmailConfirmationSentTo, workspace.Name, usr.EmailConfirmationKey})
	if err != nil {
		return nil, nil, nil, err
	}

	err = s.SendEmail(usr.EmailConfirmationSentTo, "Welcome to Featmap!", body)
	if err != nil {
		return nil, nil, nil, err
	}

	return workspace, account, member, nil
}

func (s *service) Login(email string, password string) (*Account, error) {

	acc, err := s.r.GetAccountByEmail(email)
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

	acc, err := s.r.GetAccount(id)
	if acc == nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

func (s *service) GetWorkspace(id string) (*Workspace, error) {

	workspace, err := s.r.GetWorkspace(id)
	if err != nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (s *service) GetWorkspaceByContext() *Workspace {

	workspace, err := s.GetWorkspace(s.Member.WorkspaceID)
	if err != nil {
		log.Println(err)
	}
	return workspace
}

func (s *service) GetWorkspaces() []*Workspace {

	workspace, err := s.r.GetWorkspacesByAccount(s.Acc.ID)
	if err != nil {
		log.Println(err)
		return nil
	}
	return workspace
}

func (s *service) GetMember(accountID string, workspaceID string) (*Member, error) {

	member, err := s.r.GetMemberByAccountAndWorkspace(accountID, workspaceID)
	if member == nil {
		return nil, errors.Wrap(err, "member not found")
	}
	return member, nil
}

func (s *service) GetMembers() []*Member {

	members, err := s.r.GetMembersByAccount(s.Acc.ID)
	if err != nil {
		log.Println(err)
		return nil
	}
	return members
}

// const datelayout = "2006-01-02"

// Projects

func (s *service) GetProject(id string) *Project {
	pp, err := s.r.GetProject(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return pp
}

func (s *service) CreateProjectWithID(id string, title string) (*Project, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	pp, _ := s.r.GetProject(s.Member.WorkspaceID, id)
	if pp != nil {
		return nil, errors.New("already exist")
	}

	p := &Project{
		WorkspaceID:   s.Member.WorkspaceID,
		ID:            id,
		Title:         title,
		CreatedBy:     s.Member.ID,
		CreatedAt:     time.Now(),
		CreatedByName: s.Acc.Name,
	}

	p, err = s.r.StoreProject(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) RenameProject(id string, title string) (*Project, error) {
	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	p, err := s.r.GetProject(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	p.Title = title
	p, err = s.r.StoreProject(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
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

	// if pp == nil {
	// 	pp = []*Project{}
	// }

	return pp
}

// Milestones

func (s *service) CreateMilestoneWithID(id string, projectID string, title string) (*Milestone, error) {
	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	a, _ := s.r.GetMilestone(s.Member.WorkspaceID, id)
	if a != nil {
		return nil, errors.New("already exists")
	}

	mm, _ := s.r.FindMilestonesByProject(s.Member.WorkspaceID, projectID)

	p := &Milestone{
		WorkspaceID:   s.Member.WorkspaceID,
		ProjectID:     projectID,
		ID:            id,
		Title:         title,
		Rank:          "",
		CreatedBy:     s.Member.ID,
		CreatedAt:     time.Now(),
		CreatedByName: s.Acc.Name,
	}

	n := len(mm)
	if n == 0 {
		rank, _ := lexorank.Rank("", "")
		p.Rank = rank
	} else {
		rank, _ := lexorank.Rank(mm[n-1].Rank, "")
		p.Rank = rank
	}
	
	p.LastModifiedByName = s.Acc.Name
	p, err = s.r.StoreMilestone(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) MoveMilestone(id string, index int) (*Milestone, error) {

	if index < 0 || index > 1000 {
		return nil, errors.New("index invalid")
	}

	m, err := s.r.GetMilestone(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	mm, _ := s.r.FindMilestonesByProject(s.Member.WorkspaceID, m.ProjectID)

	// Remove the item we are moving
	mmf := []*Milestone{}
	for _, x := range mm {
		if x.ID != id {
			mmf = append(mmf, x)
		}
	}

	var prevRank, nextRank string
	length := len(mmf)

	if length != 0 {
		if (index - 1) >= 0 {
			prevRank = mmf[index-1].Rank
		}

		if index < length {
			nextRank = mmf[index].Rank
		}
	}

	rank, _ := lexorank.Rank(prevRank, nextRank)

	m.Rank = rank
	m.LastModifiedByName = s.Acc.Name

	m, err = s.r.StoreMilestone(m)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
	}

	return m, nil
}

func (s *service) RenameMilestone(id string, title string) (*Milestone, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	p, err := s.r.GetMilestone(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	p.Title = title
	p.LastModifiedByName = s.Acc.Name
	p, err = s.r.StoreMilestone(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
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

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	a, _ := s.r.GetWorkflow(s.Member.WorkspaceID, id)
	if a != nil {
		return nil, errors.New("already exists")
	}

	ww, _ := s.r.FindWorkflowsByProject(s.Member.WorkspaceID, projectID)

	p := &Workflow{
		WorkspaceID:   s.Member.WorkspaceID,
		ProjectID:     projectID,
		ID:            id,
		Title:         title,
		Rank:          "",
		CreatedBy:     s.Member.ID,
		CreatedAt:     time.Now(),
		CreatedByName: s.Acc.Name,
	}

	n := len(ww)
	if n == 0 {
		rank, _ := lexorank.Rank("", "")
		p.Rank = rank
	} else {
		rank, _ := lexorank.Rank(ww[n-1].Rank, "")
		p.Rank = rank
	}
	
	p.LastModifiedByName = s.Acc.Name
	
	p, err = s.r.StoreWorkflow(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) MoveWorkflow(id string, index int) (*Workflow, error) {

	if index < 0 || index > 1000 {
		return nil, errors.New("index invalid")
	}

	m, err := s.r.GetWorkflow(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	mm, _ := s.r.FindWorkflowsByProject(s.Member.WorkspaceID, m.ProjectID)

	// Remove the item we are moving
	mmf := []*Workflow{}
	for _, x := range mm {
		if x.ID != id {
			mmf = append(mmf, x)
		}
	}

	var prevRank, nextRank string
	length := len(mmf)

	if length != 0 {
		if (index - 1) >= 0 {
			prevRank = mmf[index-1].Rank
		}

		if index < length {
			nextRank = mmf[index].Rank
		}
	}

	rank, _ := lexorank.Rank(prevRank, nextRank)

	m.Rank = rank
	m.LastModifiedByName = s.Acc.Name

	m, err = s.r.StoreWorkflow(m)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
	}

	return m, nil
}

func (s *service) RenameWorkflow(id string, title string) (*Workflow, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	p, err := s.r.GetWorkflow(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	p.Title = title
	p.LastModifiedByName = s.Acc.Name
	p, err = s.r.StoreWorkflow(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
	}

	return p, nil
}

func (s *service) DeleteWorkflow(id string) error {
	return s.r.DeleteWorkflow(s.Member.WorkspaceID, id)
}

func (s *service) GetWorkflowsByProject(id string) []*Workflow {
	pp, err := s.r.FindWorkflowsByProject(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return pp
}

// SubWorkflow
func (s *service) CreateSubWorkflowWithID(id string, workflowID string, title string) (*SubWorkflow, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	a, _ := s.r.GetSubWorkflow(s.Member.WorkspaceID, id)
	if a != nil {
		return nil, errors.New("already exists")
	}

	mm, _ := s.r.FindSubWorkflowsByWorkflow(s.Member.WorkspaceID, workflowID)

	p := &SubWorkflow{
		WorkspaceID:   s.Member.WorkspaceID,
		WorkflowID:    workflowID,
		ID:            id,
		Title:         title,
		Rank:          "",
		CreatedBy:     s.Member.ID,
		CreatedAt:     time.Now(),
		CreatedByName: s.Acc.Name}

	n := len(mm)
	if n == 0 {
		rank, _ := lexorank.Rank("", "")
		p.Rank = rank
	} else {
		rank, _ := lexorank.Rank(mm[n-1].Rank, "")
		p.Rank = rank
	}

	p, err = s.r.StoreSubWorkflow(p)
	p.LastModifiedByName = s.Acc.Name
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) MoveSubWorkflow(id string, toWorkflowID string, index int) (*SubWorkflow, error) {

	if index < 0 || index > 1000 {
		return nil, errors.New("index invalid")
	}

	m, err := s.r.GetSubWorkflow(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	mm, _ := s.r.FindSubWorkflowsByWorkflow(s.Member.WorkspaceID, toWorkflowID)

	// Remove the item we are moving
	mmf := []*SubWorkflow{}
	for _, x := range mm {
		if x.ID != id {
			mmf = append(mmf, x)
		}
	}

	var prevRank, nextRank string
	length := len(mmf)

	if length != 0 {
		if (index - 1) >= 0 {
			prevRank = mmf[index-1].Rank
		}

		if index < length {
			nextRank = mmf[index].Rank
		}
	}

	rank, _ := lexorank.Rank(prevRank, nextRank)

	m.Rank = rank
	m.WorkflowID = toWorkflowID
	m.LastModifiedByName = s.Acc.Name

	m, err = s.r.StoreSubWorkflow(m)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
	}

	return m, nil
}

func (s *service) RenameSubWorkflow(id string, title string) (*SubWorkflow, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	p, err := s.r.GetSubWorkflow(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	p.Title = title
	p.LastModifiedByName = s.Acc.Name
	p, err = s.r.StoreSubWorkflow(p)
	
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
	}

	return p, nil
}

func (s *service) DeleteSubWorkflow(id string) error {
	return s.r.DeleteSubWorkflow(s.Member.WorkspaceID, id)
}

func (s *service) GetSubWorkflowsByProject(id string) []*SubWorkflow {
	pp, err := s.r.FindSubWorkflowsByProject(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return pp
}

// Features

func (s *service) CreateFeatureWithID(id string, subWorkflowID string, milestoneID string, title string) (*Feature, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	pp, _ := s.r.GetFeature(s.Member.WorkspaceID, id)

	if pp != nil {
		return nil, errors.New("already exists")
	}

	mm, _ := s.r.FindFeaturesByMilestoneAndSubWorkflow(s.Member.WorkspaceID, milestoneID, subWorkflowID)

	p := &Feature{
		WorkspaceID:   s.Member.WorkspaceID,
		MilestoneID:   milestoneID,
		SubWorkflowID: subWorkflowID,
		ID:            id,
		Title:         title,
		Rank:          "",
		Description:   "",
		CreatedBy:     s.Member.ID,
		CreatedAt:     time.Now(),
		CreatedByName: s.Acc.Name}

	n := len(mm)
	if n == 0 {
		rank, _ := lexorank.Rank("", "")
		p.Rank = rank
	} else {
		rank, _ := lexorank.Rank(mm[n-1].Rank, "")
		p.Rank = rank
	}

	p.LastModifiedByName = s.Acc.Name
	p, err = s.r.StoreFeature(p)
	
	if err != nil {
		return nil, errors.Wrap(err, "could not create")
	}

	return p, nil
}

func (s *service) DeleteFeature(id string) error {
	return s.r.DeleteFeature(s.Member.WorkspaceID, id)
}

func (s *service) RenameFeature(id string, title string) (*Feature, error) {

	title, err := validateTitle(title)
	if err != nil {
		return nil, err
	}

	p, _ := s.r.GetFeature(s.Member.WorkspaceID, id)
	if p == nil {
		return nil, errors.Wrap(err, "could not find")
	}

	p.Title = title
	p.LastModifiedByName = s.Acc.Name
	p, err = s.r.StoreFeature(p)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
	}

	return p, nil
}

func (s *service) MoveFeature(id string, toMilestoneID string, toSubWorkflowID string, index int) (*Feature, error) {

	if index < 0 || index > 1000 {
		return nil, errors.New("index invalid")
	}

	m, err := s.r.GetFeature(s.Member.WorkspaceID, id)
	if err != nil {
		return nil, err
	}

	mm, _ := s.r.FindFeaturesByMilestoneAndSubWorkflow(s.Member.WorkspaceID, toMilestoneID, toSubWorkflowID)

	// Remove the item we are moving
	mmf := []*Feature{}
	for _, x := range mm {
		if x.ID != id {
			mmf = append(mmf, x)
		}
	}

	var prevRank, nextRank string
	length := len(mmf)

	if length != 0 {
		if (index - 1) >= 0 {
			prevRank = mmf[index-1].Rank
		}

		if index < length {
			nextRank = mmf[index].Rank
		}
	}

	rank, _ := lexorank.Rank(prevRank, nextRank)
	m.Rank = rank
	m.MilestoneID = toMilestoneID
	m.SubWorkflowID = toSubWorkflowID
	m.LastModifiedByName = s.Acc.Name

	m, err = s.r.StoreFeature(m)
	if err != nil {
		return nil, errors.Wrap(err, "could not store")
	}

	return m, nil
}

func (s *service) GetFeaturesByProject(id string) []*Feature {
	pp, err := s.r.FindFeaturesByProject(s.Member.WorkspaceID, id)
	if err != nil {
		log.Println(err)
	}
	return pp
}

func validateTitle(title string) (string, error) {
	title = govalidator.Trim(title, "")
	if len(title) < 1 {
		return title, errors.New("title too short")
	}
	if len(title) > 50 {
		return title, errors.New("title too long")
	}

	return title, nil
}

func (s *service) ConfirmEmail(key string) error {

	a, err := s.r.GetAccountByConfirmationKey(key)
	if err != nil {
		return err
	}

	if !a.EmailConfirmationPending {
		return nil
	}

	dupacc, _ := s.r.GetAccountByEmail(a.EmailConfirmationSentTo)
	if dupacc != nil && dupacc.ID != a.ID {
		return errors.New("email_taken")
	}

	a.EmailConfirmed = true
	a.Email = a.EmailConfirmationSentTo
	a.EmailConfirmationPending = false

	_, err = s.r.SaveAccount(a)
	if err != nil {
		return errors.New("save_error")
	}

	return nil
}

func (s *service) UpdateEmail(email string) error {
	dupacc, _ := s.r.GetAccountByEmail(email)
	if dupacc != nil {
		return errors.New("email_taken")
	}

	a := s.Acc

	a.EmailConfirmationSentTo = email
	a.EmailConfirmationKey = uuid.Must(uuid.NewV4(), nil).String()
	a.EmailConfirmationPending = true

	_, err := s.r.SaveAccount(a)
	if err != nil {
		return errors.New("save_error")
	}

	body, _ := ChangeEmailBody(emailBody{s.appSiteURL, a.EmailConfirmationSentTo, a.EmailConfirmationKey})

	err = s.SendEmail(email, "FeatMap: confirm your email adress", body)
	if err != nil {
		return errors.New("send_error")
	}
	return nil
}

func (s *service) UpdateName(name string) error {

	a := s.Acc

	name = govalidator.Trim(name, "")

	if len(name) < 1 || len(name) > 200 {
		return errors.New("name_invalid")
	}

	a.Name = name

	_, err := s.r.SaveAccount(a)
	if err != nil {
		return errors.New("save_error")
	}

	return nil
}

func (s *service) ResendEmail() error {

	a := s.Acc

	if !a.EmailConfirmationPending {
		return errors.New("already confirmed")
	}

	body, _ := ChangeEmailBody(emailBody{s.appSiteURL, a.EmailConfirmationSentTo, a.EmailConfirmationKey})

	err := s.SendEmail(a.EmailConfirmationSentTo, "Featmap: confirm your email adress", body)
	if err != nil {
		return errors.New("send_error")
	}
	return nil
}

func (s *service) SendResetEmail(email string) error {

	a, err := s.r.GetAccountByEmail(email)
	if err != nil {
		return errors.New("email_not_found")
	}

	body, _ := ResetPasswordBody(resetPasswordBody{s.appSiteURL, email, a.PasswordResetKey})

	err = s.SendEmail(email, "Featmap: request to reset password", body)

	if err != nil {
		return errors.New("send_error")
	}
	return nil
}

func (s *service) SetPassword(password string, key string) error {

	if len(password) < 6 || len(password) > 200 {
		return errors.New("password_invalid")
	}

	a, err := s.r.GetAccountByPasswordKey(key)
	if err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	a.Password = string(hash)
	if err != nil {
		return errors.New("encrypt_password")
	}

	_, err = s.r.SaveAccount(a)
	if err != nil {
		return errors.New("save_error")
	}

	return nil
}
