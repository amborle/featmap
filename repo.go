package main

import (
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
)

// Repository ...
type Repository interface {
	SaveWorkspace(x *Workspace) (*Workspace, error)
	FindWorkspace(workspaceID string) (*Workspace, error)
	FindWorkspaceByName(name string) (*Workspace, error)

	FindAccount(id string) (*Account, error)
	FindAccountByEmail(email string) (*Account, error)
	SaveAccount(x *Account) (*Account, error)

	SaveMember(x *Member) (*Member, error)

	FindMemberByAccountAndWorkspace(accountID string, workspaceID string) (*Member, error)

	FindProject(workspaceID string, projectID string) (*Project, error)
	FindProjectsByWorkspace(workspaceID string) ([]*Project, error)
	StoreProject(x *Project) (*Project, error)
	DeleteProject(workspaceID string, projectID string) error

	FindMilestone(workspaceID string, milestoneID string) (*Milestone, error)
	FindMilestonesByProject(workspaceID string, projectID string) ([]*Milestone, error)
	StoreMilestone(x *Milestone) (*Milestone, error)
	DeleteMilestone(workspaceID string, milestoneID string) error

	FindWorkflow(workspaceID string, workflowID string) (*Workflow, error)
	FindWorkflowsByProject(workspaceID string, projectID string) ([]*Workflow, error)
	StoreWorkflow(x *Workflow) (*Workflow, error)
	DeleteWorkflow(workspaceID string, workflowID string) error

	FindSubWorkflow(workspaceID string, subWorkflowID string) (*SubWorkflow, error)
	FindSubWorkflowsByProject(workspaceID string, projectID string) ([]*SubWorkflow, error)
	StoreSubWorkflow(x *SubWorkflow) (*SubWorkflow, error)
	DeleteSubWorkflow(workspaceID string, workflowID string) error

	FindFeature(workspaceID string, featureID string) (*Feature, error)
	FindFeaturesByProject(workspaceID string, featureID string) ([]*Feature, error)
	StoreFeature(x *Feature) (*Feature, error)
	DeleteFeature(workspaceID string, workflowID string) error
}

type repo struct {
	db *sqlx.DB
}

// NewFeatmapRepository ...
func NewFeatmapRepository(db *sqlx.DB) Repository {
	return &repo{db: db}
}

// Tentants

func (a *repo) FindWorkspace(id string) (*Workspace, error) {
	workspace := &Workspace{}
	if err := a.db.Get(workspace, "SELECT * FROM workspaces WHERE id = $1", id); err != nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (a *repo) FindWorkspaceByName(name string) (*Workspace, error) {
	workspace := &Workspace{}
	if err := a.db.Get(workspace, "SELECT * FROM workspaces WHERE name = $1", name); err != nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (a *repo) SaveWorkspace(x *Workspace) (*Workspace, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	fmt.Println(x)

	if _, err := a.db.Exec("INSERT INTO workspaces (id, name, created_at) VALUES ($1,$2,$3)", x.ID, x.Name, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing workspace")
	}

	return x, nil
}

// Accounts

func (a *repo) FindAccount(id string) (*Account, error) {

	acc := &Account{}
	if err := a.db.Get(acc, "SELECT * FROM accounts WHERE id = $1", id); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}

	return acc, nil
}

func (a *repo) FindAccountByEmail(email string) (*Account, error) {
	acc := &Account{}
	if err := a.db.Get(acc, "SELECT * FROM accounts WHERE email = $1", email); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

func (a *repo) SaveAccount(x *Account) (*Account, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if _, err := a.db.Exec("INSERT INTO accounts (id, email, password, created_at) VALUES ($1,$2,$3,$4)", x.ID, x.Email, x.Password, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing account")
	}

	return x, nil
}

// Members

func (a *repo) SaveMember(x *Member) (*Member, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if _, err := a.db.Exec("INSERT INTO members (id, workspace_id, account_id) VALUES ($1,$2,$3)", x.ID, x.WorkspaceID, x.AccountID); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing member")
	}

	return x, nil
}

func (a *repo) FindMemberByAccountAndWorkspace(accountID string, workspaceID string) (*Member, error) {
	member := &Member{}
	if err := a.db.Get(member, "SELECT * FROM members WHERE account_id = $1 AND workspace_id = $2", accountID, workspaceID); err != nil {
		return nil, errors.Wrap(err, "member not found")
	}
	return member, nil
}

// Projects

func (a *repo) FindProject(workspaceID string, projectID string) (*Project, error) {
	x := &Project{}
	if err := a.db.Get(x, "SELECT * FROM projects WHERE workspace_id = $1 AND id = $2", workspaceID, projectID); err != nil {
		return nil, errors.Wrap(err, "project not found")
	}
	return x, nil
}

func (a *repo) FindProjectsByWorkspace(workspaceID string) ([]*Project, error) {
	var x []*Project
	err := a.db.Select(&x, "SELECT * FROM projects WHERE workspace_id = $1", workspaceID)
	if err != nil {
		return nil, errors.Wrap(err, "no projects found")
	}
	return x, nil
}

func (a *repo) StoreProject(x *Project) (*Project, error) {

	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO projects (workspace_id, id, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (workspace_id, id) DO UPDATE SET title = $3", x.WorkspaceID, x.ID, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteProject(workspaceID string, projectID string) error {
	if _, err := a.db.Exec("DELETE FROM projects WHERE workspace_id=$1 AND id=$2", workspaceID, projectID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// Milestones

func (a *repo) FindMilestone(workspaceID string, milestoneID string) (*Milestone, error) {
	x := &Milestone{}
	if err := a.db.Get(x, "SELECT * FROM milestones WHERE workspace_id = $1 AND id = $2", workspaceID, milestoneID); err != nil {
		return nil, errors.Wrap(err, "milestone not found")
	}
	return x, nil
}

func (a *repo) FindMilestonesByProject(workspaceID string, projectID string) ([]*Milestone, error) {
	var x []*Milestone
	err := a.db.Select(&x, "SELECT * FROM milestones WHERE workspace_id = $1 AND project_id = $2", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreMilestone(x *Milestone) (*Milestone, error) {
	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO milestones (workspace_id, project_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (workspace_id, id) DO UPDATE SET index = $4, title = $5", x.WorkspaceID, x.ProjectID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteMilestone(workspaceID string, milestoneID string) error {
	if _, err := a.db.Exec("DELETE FROM milestones WHERE workspace_id=$1 AND id=$2", workspaceID, milestoneID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// Workflows

func (a *repo) FindWorkflow(workspaceID string, workflowID string) (*Workflow, error) {
	x := &Workflow{}
	if err := a.db.Get(x, "SELECT * FROM workflows WHERE workspace_id = $1 AND id = $2", workspaceID, workflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindWorkflowsByProject(workspaceID string, projectID string) ([]*Workflow, error) {
	var x []*Workflow
	err := a.db.Select(&x, "SELECT * FROM milestones WHERE workspace_id = $1 AND project_id = $2", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreWorkflow(x *Workflow) (*Workflow, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO workflows (workspace_id, project_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (workspace_id, id) DO UPDATE SET index = $4, title = $5", x.WorkspaceID, x.ProjectID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteWorkflow(workspaceID string, workflowID string) error {
	if _, err := a.db.Exec("DELETE FROM workflows WHERE workspace_id=$1 AND id=$2", workspaceID, workflowID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// SubWorkflows

func (a *repo) FindSubWorkflow(workspaceID string, subWorkflowID string) (*SubWorkflow, error) {
	x := &SubWorkflow{}
	if err := a.db.Get(x, "SELECT * FROM subworkflows WHERE workspace_id = $1 AND id = $2", workspaceID, subWorkflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

// TODO: fix select
func (a *repo) FindSubWorkflowsByProject(workspaceID string, projectID string) ([]*SubWorkflow, error) {
	var x []*SubWorkflow
	err := a.db.Select(&x, "SELECT * FROM subworkflows WHERE workspace_id = $1 AND project_id = $2", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreSubWorkflow(x *SubWorkflow) (*SubWorkflow, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if //noinspection ALL
	_, err := a.db.Exec("UPSERT INTO subworkflows (workspace_id, workflow_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (workspace_id, id) DO UPDATE SET workflow_id = $2,index = $4, title = $5", x.WorkspaceID, x.WorkflowID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteSubWorkflow(workspaceID string, subWorkflowID string) error {
	if _, err := a.db.Exec("DELETE FROM subworkflows WHERE workspace_id=$1 AND id=$2", workspaceID, subWorkflowID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// Features

func (a *repo) FindFeature(workspaceID string, featureID string) (*Feature, error) {
	x := &Feature{}
	if err := a.db.Get(x, "SELECT * FROM features WHERE workspace_id = $1 AND id = $2", workspaceID, featureID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

// TODO: Fix select
func (a *repo) FindFeaturesByProject(workspaceID string, projectID string) ([]*Feature, error) {
	var x []*Feature
	err := a.db.Select(&x, "SELECT * FROM features WHERE workspace_id = $1 AND project_id = $2", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreFeature(x *Feature) (*Feature, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO features (workspace_id, subworkflow_id, milestone_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (workspace_id, id) DO UPDATE SET subworkflow_id = $2, milestone_id = $3,index = $5, title = $6 ", x.WorkspaceID, x.SubWorkflowID, x.MilestoneID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteFeature(workspaceID string, featureID string) error {
	if _, err := a.db.Exec("DELETE FROM features WHERE workspace_id=$1 AND id=$2", workspaceID, featureID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}
