package main

import (
	"log"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Repository ...
type Repository interface {
	DB() *sqlx.DB

	SetTx(tx *sqlx.Tx)

	StoreWorkspace(x *Workspace)
	GetWorkspace(workspaceID string) (*Workspace, error)
	GetWorkspacesByAccount(id string) ([]*Workspace, error)
	GetWorkspaceByName(name string) (*Workspace, error)
	DeleteWorkspace(workspaceID string)

	GetAccount(id string) (*Account, error)
	GetAccountByEmail(email string) (*Account, error)
	GetAccountByConfirmationKey(key string) (*Account, error)
	GetAccountByPasswordKey(key string) (*Account, error)
	FindAccountsByWorkspace(id string) ([]*Account, error)
	StoreAccount(x *Account)
	DeleteAccount(accountID string)

	StoreMember(x *Member)
	GetMember(workspaceID string, id string) (*Member, error)
	GetMemberByAccountAndWorkspace(accountID string, workspaceID string) (*Member, error)
	GetMembersByAccount(id string) ([]*Member, error)
	GetMemberByEmail(workspaceID string, email string) (*Member, error)
	FindMembersByWorkspace(id string) ([]*Member, error)
	DeleteMember(wsid string, id string)

	StoreSubscription(z *Subscription)
	FindSubscriptionsByWorkspace(id string) ([]*Subscription, error)
	FindSubscriptionsByAccount(accID string) ([]*Subscription, error)

	StoreInvite(x *Invite)
	DeleteInvite(wsid string, id string)
	GetInviteByCode(code string) (*Invite, error)
	GetInviteByEmail(wsid string, email string) (*Invite, error)
	GetInvite(workspaceID string, id string) (*Invite, error)
	FindInvitesByWorkspace(wsid string) ([]*Invite, error)

	GetProjectByExternalLink(link string) (*Project, error)
	GetProject(workspaceID string, projectID string) (*Project, error)
	FindProjectsByWorkspace(workspaceID string) ([]*Project, error)
	StoreProject(x *Project)
	DeleteProject(workspaceID string, projectID string)

	GetMilestone(workspaceID string, milestoneID string) (*Milestone, error)
	FindMilestonesByProject(workspaceID string, projectID string) ([]*Milestone, error)
	StoreMilestone(x *Milestone)
	DeleteMilestone(workspaceID string, milestoneID string)

	GetWorkflow(workspaceID string, workflowID string) (*Workflow, error)
	FindWorkflowsByProject(workspaceID string, projectID string) ([]*Workflow, error)
	StoreWorkflow(x *Workflow)
	DeleteWorkflow(workspaceID string, workflowID string)

	GetSubWorkflow(workspaceID string, subWorkflowID string) (*SubWorkflow, error)
	FindSubWorkflowsByProject(workspaceID string, projectID string) ([]*SubWorkflow, error)
	FindSubWorkflowsByWorkflow(workspaceID string, workflowID string) ([]*SubWorkflow, error)
	StoreSubWorkflow(x *SubWorkflow)
	DeleteSubWorkflow(workspaceID string, workflowID string)

	GetFeature(workspaceID string, featureID string) (*Feature, error)
	FindFeaturesByProject(workspaceID string, projectID string) ([]*Feature, error)
	FindFeaturesByMilestoneAndSubWorkflow(workspaceID string, mid string, swid string) ([]*Feature, error)
	StoreFeature(x *Feature)
	DeleteFeature(workspaceID string, workflowID string)
}

type repo struct {
	db *sqlx.DB
	tx *sqlx.Tx
}

type txnFunc func(*sqlx.Tx) error

func txnDo(db *sqlx.DB, f txnFunc) (err error) {
	var tx *sqlx.Tx
	tx, err = db.Beginx()
	if err != nil {
		return
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		} else {
			err = tx.Commit()
		}
	}()

	return f(tx)
}

// NewFeatmapRepository ...
func NewFeatmapRepository(db *sqlx.DB) Repository {
	return &repo{db: db}
}

func (a *repo) DB() *sqlx.DB {
	return a.db
}

func (a *repo) SetTx(tx *sqlx.Tx) {
	a.tx = tx
}

// Workspaces

func (a *repo) GetWorkspace(id string) (*Workspace, error) {
	workspace := &Workspace{}
	if err := a.tx.Get(workspace, "SELECT * FROM workspaces WHERE id = $1", id); err != nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (a *repo) GetWorkspaceByName(name string) (*Workspace, error) {
	workspace := &Workspace{}
	if err := a.tx.Get(workspace, "SELECT * FROM workspaces WHERE name = $1", name); err != nil {
		return nil, errors.Wrap(err, "workspace not found")
	}
	return workspace, nil
}

func (a *repo) GetWorkspacesByAccount(id string) ([]*Workspace, error) {
	var workspaces []*Workspace
	if err := a.tx.Select(&workspaces, "SELECT * FROM workspaces w where id in (select m.workspace_id from members m where m.account_id = $1) order by w.name", id); err != nil {
		return nil, err
	}
	return workspaces, nil
}

const saveWorkspaceQuery = "INSERT INTO workspaces (id, name, created_at, allow_external_sharing, external_customer_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET allow_external_sharing = $4, external_customer_id = $5"

func (a *repo) StoreWorkspace(x *Workspace) {
	a.tx.MustExec(saveWorkspaceQuery, x.ID, x.Name, x.CreatedAt, x.AllowExternalSharing, x.ExternalCustomerID)
}

func (a *repo) DeleteWorkspace(workspaceID string) {
	a.tx.MustExec("DELETE FROM workspaces WHERE id=$1", workspaceID)
}

// Accounts

func (a *repo) GetAccount(id string) (*Account, error) {

	acc := &Account{}
	if err := a.tx.Get(acc, "SELECT * FROM accounts WHERE id = $1", id); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}

	return acc, nil
}

func (a *repo) GetAccountByEmail(email string) (*Account, error) {
	acc := &Account{}
	if err := a.tx.Get(acc, "SELECT * FROM accounts WHERE email = $1", email); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

func (a *repo) GetAccountByConfirmationKey(key string) (*Account, error) {
	acc := &Account{}
	if err := a.tx.Get(acc, "SELECT * FROM accounts WHERE email_confirmation_key = $1", key); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

func (a *repo) GetAccountByPasswordKey(key string) (*Account, error) {
	acc := &Account{}
	if err := a.tx.Get(acc, "SELECT * FROM accounts WHERE password_reset_key = $1", key); err != nil {
		return nil, errors.Wrap(err, "account not found")
	}
	return acc, nil
}

const saveAccountQuery = "INSERT INTO accounts (id, email, password, created_at, email_confirmation_sent_to, email_confirmed, email_confirmation_key,email_confirmation_pending, password_reset_key, name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO UPDATE SET email = $2, password = $3, email_confirmation_sent_to = $5, email_confirmed = $6,email_confirmation_key = $7,email_confirmation_pending = $8, password_reset_key=$9, name=$10"

func (a *repo) StoreAccount(x *Account) {
	a.tx.MustExec(saveAccountQuery, x.ID, x.Email, x.Password, x.CreatedAt, x.EmailConfirmationSentTo, x.EmailConfirmed, x.EmailConfirmationKey, x.EmailConfirmationPending, x.PasswordResetKey, x.Name)

}

func (a *repo) FindAccountsByWorkspace(id string) ([]*Account, error) {
	accounts := []*Account{}
	if err := a.tx.Select(&accounts, "SELECT * FROM accounts a where a.id in (select m.account_id from members m where m.workspace_id = $1)", id); err != nil {
		return nil, err
	}
	return accounts, nil
}

func (a *repo) DeleteAccount(accountID string) {
	a.tx.MustExec("DELETE FROM accounts WHERE id=$1", accountID)
}

// Members

const saveMemberQuery = "INSERT INTO members (id, workspace_id, account_id, level, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (workspace_id, id) DO UPDATE SET level = $4"

func (a *repo) StoreMember(x *Member) {
	a.tx.MustExec(saveMemberQuery, x.ID, x.WorkspaceID, x.AccountID, x.Level, x.CreatedAt)
}

func (a *repo) DeleteMember(wsid string, id string) {
	a.tx.MustExec("DELETE FROM members WHERE workspace_id = $1 AND id = $2", wsid, id)

}

func (a *repo) GetMemberByAccountAndWorkspace(accountID string, workspaceID string) (*Member, error) {
	member := &Member{}
	if err := a.tx.Get(member, "SELECT * FROM members WHERE account_id = $1 AND workspace_id = $2", accountID, workspaceID); err != nil {
		return nil, errors.Wrap(err, "member not found")
	}
	return member, nil
}

func (a *repo) GetMember(workspaceID string, id string) (*Member, error) {
	member := &Member{}
	if err := a.tx.Get(member, "SELECT * FROM members WHERE workspace_id = $1 AND id = $2", workspaceID, id); err != nil {
		return nil, errors.Wrap(err, "member not found")
	}
	return member, nil
}

func (a *repo) GetMembersByAccount(id string) ([]*Member, error) {
	var members []*Member
	if err := a.tx.Select(&members, "SELECT * FROM members WHERE account_id = $1", id); err != nil {
		return nil, err
	}
	return members, nil
}

func (a *repo) GetMemberByEmail(workspaceID string, email string) (*Member, error) {
	member := &Member{}
	if err := a.tx.Get(member, "SELECT * FROM members m WHERE m.workspace_id = $1 AND m.account_id IN (SELECT id FROM accounts a WHERE a.email = $2) ", workspaceID, email); err != nil {
		log.Println(err)
		return nil, err
	}
	return member, nil
}

func (a *repo) FindMembersByWorkspace(id string) ([]*Member, error) {
	x := []*Member{}
	if err := a.tx.Select(&x, "SELECT m.workspace_id, m.id, m.account_id, m.level, m.created_at, a.name, a.email FROM members m INNER JOIN accounts a ON m.account_id = a.id WHERE m.workspace_id = $1 ORDER by m.created_at DESC ", id); err != nil {
		//if err := a.tx.Select(&x, "SELECT * FROM members m WHERE m.workspace_id = $1 ", id); err != nil {
		return nil, err
	}
	return x, nil
}

// Subscriptions

const storeSubQuery = "INSERT INTO subscriptions (id, workspace_id,level, number_of_editors, from_date,expiration_date, created_by_name, created_at, last_modified, last_modified_by_name, external_status, external_customer_id, external_plan_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (workspace_id, id) DO UPDATE SET level = $3, number_of_editors = $4, from_date = $5,expiration_date = $6, created_by_name = $7, created_at = $8, last_modified = $9, last_modified_by_name = $10, external_status = $11, external_customer_id = $12, external_plan_id = $13"

func (a *repo) StoreSubscription(x *Subscription) {
	a.tx.MustExec(storeSubQuery, x.ID, x.WorkspaceID, x.Level, x.NumberOfEditors, x.FromDate, x.ExpirationDate, x.CreatedByName, x.CreatedAt, x.LastModified, x.LastModifiedByName, x.ExternalStatus, x.ExternalCustomerID, x.ExternalPlanID)
}

func (a *repo) FindSubscriptionsByWorkspace(id string) ([]*Subscription, error) {
	x := []*Subscription{}
	err := a.tx.Select(&x, "SELECT * FROM subscriptions WHERE workspace_id = $1 order by created_at desc", id)
	if err != nil {
		log.Println(err)
		return nil, errors.Wrap(err, "no subscriptions found")
	}
	return x, nil
}

func (a *repo) FindSubscriptionsByAccount(accID string) ([]*Subscription, error) {
	x := []*Subscription{}
	log.Println(accID)

	err := a.tx.Select(&x, "SELECT DISTINCT ON (s.workspace_id) * FROM subscriptions s WHERE s.workspace_id IN  (select m.workspace_id from members m where m.account_id = $1) order by s.workspace_id, s.from_date desc", accID)
	if err != nil {
		log.Println(err)
		return nil, errors.Wrap(err, "no subscriptions found")
	}
	return x, nil
}

// IVITES

func (a *repo) StoreInvite(x *Invite) {
	a.tx.MustExec("INSERT INTO invites (workspace_id, id, email, level, code, created_by, created_by_name, created_at, created_by_email, workspace_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", x.WorkspaceID, x.ID, x.Email, x.Level, x.Code, x.CreatedBy, x.CreatedByName, x.CreatedAt, x.CreatedByEmail, x.WorkspaceName)
}

func (a *repo) DeleteInvite(wsid string, id string) {
	a.tx.MustExec("DELETE FROM invites WHERE workspace_id = $1 AND id = $2", wsid, id)
}

func (a *repo) GetInviteByCode(code string) (*Invite, error) {
	x := &Invite{}
	if err := a.tx.Get(x, "SELECT * FROM invites WHERE code = $1", code); err != nil {
		log.Println(err)
		return nil, err
	}
	return x, nil
}

func (a *repo) GetInviteByEmail(workspaceID string, email string) (*Invite, error) {
	x := &Invite{}
	if err := a.tx.Get(x, "SELECT * FROM invites  WHERE workspace_id = $1 AND email = $2 ", workspaceID, email); err != nil {
		log.Println(err)
		return nil, err
	}
	return x, nil
}

func (a *repo) GetInvite(workspaceID string, id string) (*Invite, error) {
	x := &Invite{}
	if err := a.tx.Get(x, "SELECT * FROM invites WHERE workspace_id = $1 AND id = $2", workspaceID, id); err != nil {
		log.Println(err)
		return nil, err
	}
	return x, nil
}

func (a *repo) FindInvitesByWorkspace(wsid string) ([]*Invite, error) {
	x := []*Invite{}
	if err := a.tx.Select(&x, "SELECT * FROM invites WHERE workspace_id = $1", wsid); err != nil {
		log.Println(err)
		return nil, err
	}
	return x, nil
}

// Projects

func (a *repo) GetProject(workspaceID string, projectID string) (*Project, error) {
	x := &Project{}
	if err := a.tx.Get(x, "SELECT * FROM projects WHERE workspace_id = $1 AND id = $2", workspaceID, projectID); err != nil {
		return nil, errors.Wrap(err, "project not found")
	}
	return x, nil
}

func (a *repo) GetProjectByExternalLink(link string) (*Project, error) {
	x := &Project{}
	if err := a.tx.Get(x, "SELECT * FROM projects WHERE external_link = $1", link); err != nil {
		return nil, errors.Wrap(err, "project not found")
	}
	return x, nil
}

func (a *repo) FindProjectsByWorkspace(workspaceID string) ([]*Project, error) {
	x := []*Project{}
	err := a.tx.Select(&x, "SELECT * FROM projects WHERE workspace_id = $1", workspaceID)
	if err != nil {
		return nil, errors.Wrap(err, "no projects found")
	}
	return x, nil
}

func (a *repo) StoreProject(x *Project) {
	a.tx.MustExec("INSERT INTO projects (workspace_id, id, title, created_by, created_at,created_by_name, description, last_modified, last_modified_by_name, external_link) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (workspace_id, id) DO UPDATE SET title = $3, description = $7, last_modified = $8, last_modified_by_name = $9, external_link = $10", x.WorkspaceID, x.ID, x.Title, x.CreatedBy, x.CreatedAt, x.CreatedByName, x.Description, x.LastModified, x.LastModifiedByName, x.ExternalLink)
}

func (a *repo) DeleteProject(workspaceID string, projectID string) {
	a.tx.MustExec("DELETE FROM projects WHERE workspace_id=$1 AND id=$2", workspaceID, projectID)
}

// Milestones

func (a *repo) GetMilestone(workspaceID string, milestoneID string) (*Milestone, error) {
	x := &Milestone{}
	if err := a.tx.Get(x, "SELECT * FROM milestones WHERE workspace_id = $1 AND id = $2", workspaceID, milestoneID); err != nil {
		return nil, errors.Wrap(err, "milestone not found")
	}
	return x, nil
}

func (a *repo) FindMilestonesByProject(workspaceID string, projectID string) ([]*Milestone, error) {
	x := []*Milestone{}
	err := a.tx.Select(&x, "SELECT * FROM milestones WHERE workspace_id = $1 AND project_id = $2 ORDER by rank", workspaceID, projectID)
	if err != nil {
		return nil, err
	}
	return x, nil
}

func (a *repo) StoreMilestone(x *Milestone) {
	a.tx.MustExec("INSERT INTO milestones (workspace_id, project_id, id, rank, title, created_by, created_at,created_by_name, description, last_modified, last_modified_by_name,status, color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11, $12,$13) ON CONFLICT (workspace_id, id) DO UPDATE SET rank = $4, title = $5, description = $9, last_modified = $10, last_modified_by_name = $11, status = $12,color = $13", x.WorkspaceID, x.ProjectID, x.ID, x.Rank, x.Title, x.CreatedBy, x.CreatedAt, x.CreatedByName, x.Description, x.LastModified, x.LastModifiedByName, x.Status, x.Color)
}

func (a *repo) DeleteMilestone(workspaceID string, milestoneID string) {
	a.tx.MustExec("DELETE FROM milestones WHERE workspace_id=$1 AND id=$2", workspaceID, milestoneID)
}

// Workflows

func (a *repo) GetWorkflow(workspaceID string, workflowID string) (*Workflow, error) {
	x := &Workflow{}
	if err := a.tx.Get(x, "SELECT * FROM workflows WHERE workspace_id = $1 AND id = $2", workspaceID, workflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindWorkflowsByProject(workspaceID string, projectID string) ([]*Workflow, error) {
	x := []*Workflow{}
	err := a.tx.Select(&x, "SELECT * FROM workflows WHERE workspace_id = $1 and project_id = $2 order by rank", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "none found")
	}
	return x, nil
}

func (a *repo) StoreWorkflow(x *Workflow) {
	a.tx.MustExec("INSERT INTO workflows (workspace_id, project_id, id, rank, title, created_by, created_at, created_by_name, description,last_modified,last_modified_by_name,color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (workspace_id, id) DO UPDATE SET rank = $4, title = $5, description = $9, last_modified = $10, last_modified_by_name = $11, color = $12", x.WorkspaceID, x.ProjectID, x.ID, x.Rank, x.Title, x.CreatedBy, x.CreatedAt, x.CreatedByName, x.Description, x.LastModified, x.LastModifiedByName, x.Color)
}

func (a *repo) DeleteWorkflow(workspaceID string, workflowID string) {
	a.tx.MustExec("DELETE FROM workflows WHERE workspace_id=$1 AND id=$2", workspaceID, workflowID)
}

// SubWorkflows

func (a *repo) GetSubWorkflow(workspaceID string, subWorkflowID string) (*SubWorkflow, error) {
	x := &SubWorkflow{}
	if err := a.tx.Get(x, "SELECT * FROM subworkflows WHERE workspace_id = $1 AND id = $2", workspaceID, subWorkflowID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindSubWorkflowsByProject(workspaceID string, projectID string) ([]*SubWorkflow, error) {
	x := []*SubWorkflow{}
	err := a.tx.Select(&x, "SELECT * FROM subworkflows s WHERE s.workspace_id = $1 AND s.workflow_id in (select w.id from workflows w where w.workspace_id = $1 and w.project_id = $2)", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) FindSubWorkflowsByWorkflow(workspaceID string, workflowID string) ([]*SubWorkflow, error) {
	x := []*SubWorkflow{}
	err := a.tx.Select(&x, "SELECT * FROM subworkflows s WHERE s.workspace_id = $1 AND s.workflow_id = $2 ORDER BY s.rank", workspaceID, workflowID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil

}

func (a *repo) StoreSubWorkflow(x *SubWorkflow) {
	a.tx.MustExec("INSERT INTO subworkflows (workspace_id, workflow_id, id, rank, title, created_by, created_at,created_by_name, description, last_modified,last_modified_by_name,color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (workspace_id, id) DO UPDATE SET workflow_id = $2,rank = $4, title = $5, description = $9, last_modified = $10, last_modified_by_name = $11, color = $12", x.WorkspaceID, x.WorkflowID, x.ID, x.Rank, x.Title, x.CreatedBy, x.CreatedAt, x.CreatedByName, x.Description, x.LastModified, x.LastModifiedByName, x.Color)
}

func (a *repo) DeleteSubWorkflow(workspaceID string, subWorkflowID string) {
	a.tx.MustExec("DELETE FROM subworkflows WHERE workspace_id=$1 AND id=$2", workspaceID, subWorkflowID)
}

// Features

func (a *repo) GetFeature(workspaceID string, featureID string) (*Feature, error) {
	x := &Feature{}
	if err := a.tx.Get(x, "SELECT * FROM features WHERE workspace_id = $1 AND id = $2", workspaceID, featureID); err != nil {
		return nil, errors.Wrap(err, "not found")
	}
	return x, nil
}

func (a *repo) FindFeaturesByProject(workspaceID string, projectID string) ([]*Feature, error) {
	x := []*Feature{}
	err := a.tx.Select(&x, "SELECT * FROM features f WHERE f.workspace_id = $1 AND f.milestone_id IN (select m.id from milestones m where m.workspace_id = $1 and m.project_id = $2) ", workspaceID, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) FindFeaturesByMilestoneAndSubWorkflow(workspaceID string, mid string, swid string) ([]*Feature, error) {
	x := []*Feature{}
	err := a.tx.Select(&x, "SELECT * FROM features f WHERE f.workspace_id = $1 AND f.milestone_id = $2 AND f.subworkflow_id = $3 ORDER BY f.rank", workspaceID, mid, swid)
	if err != nil {
		return nil, errors.Wrap(err, "no found")
	}
	return x, nil
}

func (a *repo) StoreFeature(x *Feature) {
	a.tx.MustExec("INSERT INTO features (workspace_id, subworkflow_id, milestone_id, id, rank, title, created_by, created_at, description, created_by_name, last_modified,last_modified_by_name, status, color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (workspace_id, id) DO UPDATE SET subworkflow_id = $2, milestone_id = $3,rank = $5, title = $6,  description = $9, last_modified = $11, last_modified_by_name = $12, status = $13, color = $14 ", x.WorkspaceID, x.SubWorkflowID, x.MilestoneID, x.ID, x.Rank, x.Title, x.CreatedBy, x.CreatedAt, x.Description, x.CreatedByName, x.LastModified, x.LastModifiedByName, x.Status, x.Color)
}

func (a *repo) DeleteFeature(workspaceID string, featureID string) {
	a.tx.MustExec("DELETE FROM features WHERE workspace_id=$1 AND id=$2", workspaceID, featureID)
}
