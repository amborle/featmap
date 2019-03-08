package main

import (
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
	"github.com/satori/go.uuid"
)

// Repository ...
type Repository interface {
	StoreTenant(x *Tenant) (*Tenant, error)
	FindTenant(tenantID string) (*Tenant, error)

	FindAccount(tenantID string, userID string) (*Account, error)
	FindAccountByEmail(email string) (*Account, error)
	StoreAccount(x *Account) (*Account, error)

	FindProject(tenantID string, projectID string) (*Project, error)
	FindProjectsByTenant(tenantID string) ([]*Project, error)
	StoreProject(x *Project) (*Project, error)
	DeleteProject(tenantID string, projectID string) error

	FindMilestone(tenantID string, milestoneID string) (*Milestone, error)
	FindMilestonesByProject(tenantID string, projectID string) ([]*Milestone, error)
	StoreMilestone(x *Milestone) (*Milestone, error)
	DeleteMilestone(tenantID string, milestoneID string) error

	FindWorkflow(tenantID string, workflowID string) (*Workflow, error)
	FindWorkflowsByProject(tenantID string, projectID string) ([]*Workflow, error)
	StoreWorkflow(x *Workflow) (*Workflow, error)
	DeleteWorkflow(tenantID string, workflowID string) error

	FindSubWorkflow(tenantID string, subWorkflowID string) (*SubWorkflow, error)
	FindSubWorkflowsByProject(tenantID string, projectID string) ([]*SubWorkflow, error)
	StoreSubWorkflow(x *SubWorkflow) (*SubWorkflow, error)
	DeleteSubWorkflow(tenantID string, workflowID string) error

	FindFeature(tenantID string, featureID string) (*Feature, error)
	FindFeaturesByProject(tenantID string, featureID string) ([]*Feature, error)
	StoreFeature(x *Feature) (*Feature, error)
	DeleteFeature(tenantID string, workflowID string) error
}

type repo struct {
	db *sqlx.DB
}

// NewFeatmapRepository ...
func NewFeatmapRepository(db *sqlx.DB) Repository {
	return &repo{db: db}
}

// Tentants

func (a *repo) FindTenant(tenantID string) (*Tenant, error) {
	tenant := &Tenant{}
	if err := a.db.Get(tenant, "SELECT * FROM tenants WHERE id = $1", tenantID); err != nil {
		return nil, errors.Wrap(err, "tenant not found")
	}
	return tenant, nil
}

func (a *repo) StoreTenant(x *Tenant) (*Tenant, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if //noinspection ALL
	_, err := a.db.Exec("UPSERT INTO tenants (tenant_id, name, created_at) VALUES ($1,$2,$3)", x.ID, x.Name, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing tenant")
	}

	return x, nil
}

// Accounts

func (a *repo) FindAccount(tenantID string, accountID string) (*Account, error) {

	acc := &Account{}
	if err := a.db.Get(acc, "SELECT * FROM accounts WHERE tenant_id = $1 AND id = $2", tenantID, accountID); err != nil {
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

func (a *repo) StoreAccount(x *Account) (*Account, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if //noinspection ALL
	_, err := a.db.Exec("UPSERT INTO accounts (tenant_id, id, email, password) VALUES ($1,$2,$3,$4)", x.TenantID, x.ID, x.Email, x.Password); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing account")
	}

	return x, nil
}

// Projects

func (a *repo) FindProject(tenantID string, projectID string) (*Project, error) {
	x := &Project{}
	if err := a.db.Get(x, "SELECT * FROM projects WHERE tenant_id = $1 AND id = $2", tenantID, projectID); err != nil {
		return nil, errors.Wrap(err, "project not found")
	}
	return x, nil
}

func (a *repo) FindProjectsByTenant(tenantID string) ([]*Project, error) {
	var x []*Project
	err := a.db.Select(&x, "SELECT * FROM projects WHERE tenant_id = $1", tenantID)
	if err != nil {
		return nil, errors.Wrap(err, "no projects found")
	}
	return x, nil
}

func (a *repo) StoreProject(x *Project) (*Project, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if //noinspection ALL
	_, err := a.db.Exec("UPSERT INTO projects (tenant_id, id, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5)", x.TenantID, x.ID, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteProject(tenantID string, projectID string) error {
	if _, err := a.db.Exec("DELETE FROM projects WHERE tenant_id=$1 AND id=$2", tenantID, projectID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// Milestones

func (a *repo) FindMilestone(tenantID string, milestoneID string) (*Milestone, error) {
	x := &Milestone{}
	if err := a.db.Get(x, "SELECT * FROM milestones WHERE tenant_id = $1 AND id = $2", tenantID, milestoneID); err != nil {
		return nil, errors.Wrap(err, "project not found")
	}
	return x, nil
}

func (a *repo) FindMilestonesByProject(tenantID string, projectID string) ([]*Milestone, error) {
	var x []*Milestone
	err := a.db.Select(&x, "SELECT * FROM milestones WHERE tenant_id = $1 AND project_id = $2", tenantID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreMilestone(x *Milestone) (*Milestone, error) {

	if x.ID == "" {
		x.ID = uuid.Must(uuid.NewV4(), nil).String()
	}

	if //noinspection ALL
	_, err := a.db.Exec("UPSERT INTO milestone (tenant_id, project_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6)", x.TenantID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteMilestone(tenantID string, milestoneID string) error {
	if _, err := a.db.Exec("DELETE FROM milestones WHERE tenant_id=$1 AND id=$2", tenantID, milestoneID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// Workflows

func (a *repo) FindWorkflow(tenantID string, workflowID string) (*Workflow, error) {
	x := &Workflow{}
	if err := a.db.Get(x, "SELECT * FROM workflows WHERE tenant_id = $1 AND id = $2", tenantID, workflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindWorkflowsByProject(tenantID string, projectID string) ([]*Workflow, error) {
	var x []*Workflow
	err := a.db.Select(&x, "SELECT * FROM milestones WHERE tenant_id = $1 AND project_id = $2", tenantID, projectID)
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
	_, err := a.db.Exec("UPSERT INTO workflows (tenant_id, project_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6)", x.TenantID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteWorkflow(tenantID string, workflowID string) error {
	if _, err := a.db.Exec("DELETE FROM workflows WHERE tenant_id=$1 AND id=$2", tenantID, workflowID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// SubWorkflows

func (a *repo) FindSubWorkflow(tenantID string, subWorkflowID string) (*SubWorkflow, error) {
	x := &SubWorkflow{}
	if err := a.db.Get(x, "SELECT * FROM subworkflows WHERE tenant_id = $1 AND id = $2", tenantID, subWorkflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

// TODO: fix select
func (a *repo) FindSubWorkflowsByProject(tenantID string, projectID string) ([]*SubWorkflow, error) {
	var x []*SubWorkflow
	err := a.db.Select(&x, "SELECT * FROM subworkflows WHERE tenant_id = $1 AND project_id = $2", tenantID, projectID)
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
	_, err := a.db.Exec("UPSERT INTO subworkflows (tenant_id, workflow_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)", x.TenantID, x.WorkflowID, x.ID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteSubWorkflow(tenantID string, subWorkflowID string) error {
	if _, err := a.db.Exec("DELETE FROM subworkflows WHERE tenant_id=$1 AND id=$2", tenantID, subWorkflowID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}

// Features

func (a *repo) FindFeature(tenantID string, featureID string) (*Feature, error) {
	x := &Feature{}
	if err := a.db.Get(x, "SELECT * FROM features WHERE tenant_id = $1 AND id = $2", tenantID, featureID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

// TODO: Fix select
func (a *repo) FindFeaturesByProject(tenantID string, projectID string) ([]*Feature, error) {
	var x []*Feature
	err := a.db.Select(&x, "SELECT * FROM features WHERE tenant_id = $1 AND project_id = $2", tenantID, projectID)
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
	_, err := a.db.Exec("UPSERT INTO features (tenant_id, subworkflow_id, milestone_id, id, index, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", x.TenantID, x.SubWorkflowID, x.MilestoneID, x.Index, x.Title, x.CreatedBy, x.CreatedAt); err != nil {
		return nil, errors.Wrap(err, "something went wrong when storing")
	}

	return x, nil
}

func (a *repo) DeleteFeature(tenantID string, featureID string) error {
	if _, err := a.db.Exec("DELETE FROM features WHERE tenant_id=$1 AND id=$2", tenantID, featureID); err != nil {
		return errors.Wrap(err, "error when deleting ")
	}
	return nil
}
