package main

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Repository ...
type Repository interface {
	SaveWorkspace(x *Workspace) (*Workspace, error)
	GetWorkspace(workspaceID string) (*Workspace, error)
	GetWorkspacesByAccount(id string) ([]*Workspace, error)
	GetWorkspaceByName(name string) (*Workspace, error)

	GetAccount(id string) (*Account, error)
	GetAccountByEmail(email string) (*Account, error)
	GetAccountByConfirmationKey(key string) (*Account, error)
	GetAccountByPasswordKey(key string) (*Account, error)
	SaveAccount(x *Account) (*Account, error)

	SaveMember(x *Member) (*Member, error)

	GetMemberByAccountAndWorkspace(accountID string, workspaceID string) (*Member, error)
	GetMembersByAccount(id string) ([]*Member, error)

	GetProject(workspaceID string, projectID string) (*Project, error)
	FindProjectsByWorkspace(workspaceID string) ([]*Project, error)
	StoreProject(x *Project) (*Project, error)
	DeleteProject(workspaceID string, projectID string) error

	GetMilestone(workspaceID string, milestoneID string) (*Milestone, error)
	FindMilestonesByProject(workspaceID string, projectID string) ([]*Milestone, error)
	StoreMilestone(x *Milestone) (*Milestone, error)
	DeleteMilestone(workspaceID string, milestoneID string) error

	GetWorkflow(workspaceID string, workflowID string) (*Workflow, error)
	FindWorkflowsByProject(workspaceID string, projectID string) ([]*Workflow, error)
	StoreWorkflow(x *Workflow) (*Workflow, error)
	DeleteWorkflow(workspaceID string, workflowID string) error

	GetSubWorkflow(workspaceID string, subWorkflowID string) (*SubWorkflow, error)
	FindSubWorkflowsByProject(workspaceID string, projectID string) ([]*SubWorkflow, error)
	StoreSubWorkflow(x *SubWorkflow) (*SubWorkflow, error)
	DeleteSubWorkflow(workspaceID string, workflowID string) error

	GetFeature(workspaceID string, featureID string) (*Feature, error)
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

func (a *repo) GetWorkspace(id string) (*Workspace, error) {
	workspace := &Workspace{}
	if err := a.db.Get(workspace, "SELECT * FROM workspaces WHERE id = $1", id); err != nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (a *repo) GetWorkspaceByName(name string) (*Workspace, error) {
	workspace := &Workspace{}
	if err := a.db.Get(workspace, "SELECT * FROM workspaces WHERE name = $1", name); err != nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (a *repo) GetWorkspacesByAccount(id string) ([]*Workspace, error) {
	var workspaces []*Workspace
	if err := a.db.Select(&workspaces, "SELECT * FROM workspaces w where id in (select m.workspace_id from members m where m.account_id = $1)", id); err != nil {
		return nil, err
	}
	return workspaces, nil
}

func (a *repo) SaveWorkspace(x *Workspace) (*Workspace, error) {

	fmt.Println(x)

	if _, err := a.db.Exec("INSERT INTO workspaces (id, name, created_at) VALUES ($1,$2,$3)", x.ID, x.Name, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing workspace")
	}

	return x, nil
}

// Accounts

func (a *repo) GetAccount(id string) (*Account, error) {

	acc := &Account{}
	if err := a.db.Get(acc, "SELECT * FROM accounts WHERE id = $1", id); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}

	return acc, nil
}

func (a *repo) GetAccountByEmail(email string) (*Account, error) {
	acc := &Account{}
	if err := a.db.Get(acc, "SELECT * FROM accounts WHERE email = $1", email); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

func (a *repo) GetAccountByConfirmationKey(key string) (*Account, error) {
	acc := &Account{}
	if err := a.db.Get(acc, "SELECT * FROM accounts WHERE email_confirmation_key = $1", key); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

func (a *repo) GetAccountByPasswordKey(key string) (*Account, error) {
	acc := &Account{}
	log.Println("KEY")
	log.Println(key)
	if err := a.db.Get(acc, "SELECT * FROM accounts WHERE password_reset_key = $1", key); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

func (a *repo) SaveAccount(x *Account) (*Account, error) {

	if _, err := a.db.Exec("INSERT INTO accounts (id, email, password, created_at, email_confirmation_sent_to, email_confirmed, email_confirmation_key,email_confirmation_pending, password_reset_key, name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO UPDATE SET email = $2, password = $3, email_confirmation_sent_to = $5, email_confirmed = $6,email_confirmation_key = $7,email_confirmation_pending = $8, password_reset_key=$9, name=$10", x.ID, x.Email, x.Password, x.CreatedAt, x.EmailConfirmationSentTo, x.EmailConfirmed, x.EmailConfirmationKey, x.EmailConfirmationPending, x.PasswordResetKey, x.Name); err != nil {
		return nil, errors.Wrap(err, "something went wrong when saving account")
	}

	return x, nil
}

// Members

func (a *repo) SaveMember(x *Member) (*Member, error) {
	if _, err := a.db.Exec("INSERT INTO members (id, workspace_id, account_id) VALUES ($1,$2,$3)", x.ID, x.WorkspaceID, x.AccountID); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing member")
	}

	return x, nil
}

func (a *repo) GetMemberByAccountAndWorkspace(accountID string, workspaceID string) (*Member, error) {
	member := &Member{}
	if err := a.db.Get(member, "SELECT * FROM members WHERE account_id = $1 AND workspace_id = $2", accountID, workspaceID); err != nil {
		return nil, errors.Wrap(err, "member not found")
	}
	return member, nil
}

func (a *repo) GetMembersByAccount(id string) ([]*Member, error) {
	var members []*Member
	if err := a.db.Select(&members, "SELECT * FROM members WHERE account_id = $1", id); err != nil {
		return nil, err
	}
	return members, nil
}

// Projects

func (a *repo) GetProject(workspaceID string, projectID string) (*Project, error) {
	x := &Project{}
	if err := a.db.Get(x, "SELECT * FROM projects WHERE workspace_id = $1 AND id = $2", workspaceID, projectID); err != nil {
		return nil, errors.Wrap(err, "project not found")
	}
	return x, nil
}

func (a *repo) FindProjectsByWorkspace(workspaceID string) ([]*Project, error) {
	x := []*Project{}
	err := a.db.Select(&x, "SELECT * FROM projects WHERE workspace_id = $1", workspaceID)
	if err != nil {
		return nil, errors.Wrap(err, "no projects found")
	}
	return x, nil
}

func (a *repo) StoreProject(x *Project) (*Project, error) {

	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO projects (workspace_id, id, title, created_by, created_at,created_by_name) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (workspace_id, id) DO UPDATE SET title = $3", x.WorkspaceID, x.ID, x.Title, x.CreatedBy, x.CreatedAt, x.CreatedByName); err != nil {
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

func (a *repo) GetMilestone(workspaceID string, milestoneID string) (*Milestone, error) {
	x := &Milestone{}
	if err := a.db.Get(x, "SELECT * FROM milestones WHERE workspace_id = $1 AND id = $2", workspaceID, milestoneID); err != nil {
		return nil, errors.Wrap(err, "milestone not found")
	}
	return x, nil
}

func (a *repo) FindMilestonesByProject(workspaceID string, projectID string) ([]*Milestone, error) {
	x := []*Milestone{}
	err := a.db.Select(&x, "SELECT * FROM milestones WHERE workspace_id = $1 AND project_id = $2", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreMilestone(x *Milestone) (*Milestone, error) {
	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO milestones (workspace_id, project_id, id, index, title, created_by, created_at,created_by_name) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (workspace_id, id) DO UPDATE SET index = $4, title = $5", x.WorkspaceID, x.ProjectID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
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

func (a *repo) GetWorkflow(workspaceID string, workflowID string) (*Workflow, error) {
	x := &Workflow{}
	if err := a.db.Get(x, "SELECT * FROM workflows WHERE workspace_id = $1 AND id = $2", workspaceID, workflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindWorkflowsByProject(workspaceID string, projectID string) ([]*Workflow, error) {
	x := []*Workflow{}
	err := a.db.Select(&x, "SELECT * FROM workflows WHERE workspace_id = $1 and project_id = $2", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "none found")
	}
	return x, nil
}

func (a *repo) StoreWorkflow(x *Workflow) (*Workflow, error) {

	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO workflows (workspace_id, project_id, id, index, title, created_by, created_at, created_by_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (workspace_id, id) DO UPDATE SET index = $4, title = $5", x.WorkspaceID, x.ProjectID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt, x.CreatedByName); err != nil {
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

func (a *repo) GetSubWorkflow(workspaceID string, subWorkflowID string) (*SubWorkflow, error) {
	x := &SubWorkflow{}
	if err := a.db.Get(x, "SELECT * FROM subworkflows WHERE workspace_id = $1 AND id = $2", workspaceID, subWorkflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindSubWorkflowsByProject(workspaceID string, projectID string) ([]*SubWorkflow, error) {
	x := []*SubWorkflow{}
	err := a.db.Select(&x, "SELECT * FROM subworkflows s WHERE s.workspace_id = $1 AND s.workflow_id in (select w.id from workflows w where w.workspace_id = $1 and w.project_id = $2)", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreSubWorkflow(x *SubWorkflow) (*SubWorkflow, error) {

	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO subworkflows (workspace_id, workflow_id, id, index, title, created_by, created_at,created_by_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (workspace_id, id) DO UPDATE SET workflow_id = $2,index = $4, title = $5", x.WorkspaceID, x.WorkflowID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt, x.CreatedByName); err != nil {
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

func (a *repo) GetFeature(workspaceID string, featureID string) (*Feature, error) {
	x := &Feature{}
	if err := a.db.Get(x, "SELECT * FROM features WHERE workspace_id = $1 AND id = $2", workspaceID, featureID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindFeaturesByProject(workspaceID string, projectID string) ([]*Feature, error) {
	x := []*Feature{}
	err := a.db.Select(&x, "SELECT * FROM features f WHERE f.workspace_id = $1 AND f.milestone_id IN (select m.id from milestones m where m.workspace_id = $1 and m.project_id = $2) ", workspaceID, projectID)
	if err != nil {
		log.Println(err)

		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreFeature(x *Feature) (*Feature, error) {
	if //noinspection ALL
	_, err := a.db.Exec("INSERT INTO features (workspace_id, subworkflow_id, milestone_id, id, index, title, created_by, created_at, description, created_by_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10) ON CONFLICT (workspace_id, id) DO UPDATE SET subworkflow_id = $2, milestone_id = $3,index = $5, title = $6,  description = $9 ", x.WorkspaceID, x.SubWorkflowID, x.MilestoneID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt, x.Description, x.CreatedByName); err != nil {
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
