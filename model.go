package main

import "time"

// Workspace ...
type Workspace struct {
	ID                   string    `db:"id" json:"id"`
	Name                 string    `db:"name" json:"name"`
	CreatedAt            time.Time `db:"created_at" json:"createdAt"`
	AllowExternalSharing bool      `db:"allow_external_sharing" json:"allowExternalSharing"`
	ExternalCustomerID   string    `db:"external_customer_id" json:"-"`
}

// Account ...
type Account struct {
	ID                       string    `db:"id" json:"id"`
	Name                     string    `db:"name" json:"name"`
	Email                    string    `db:"email" json:"email"`
	Password                 string    `db:"password" json:"-"`
	CreatedAt                time.Time `db:"created_at" json:"createdAt"`
	EmailConfirmed           bool      `db:"email_confirmed" json:"emailConfirmed"`
	EmailConfirmationSentTo  string    `db:"email_confirmation_sent_to" json:"emailConfirmationSentTo"`
	EmailConfirmationKey     string    `db:"email_confirmation_key" json:"-"`
	EmailConfirmationPending bool      `db:"email_confirmation_pending" json:"emailConfirmationPending"`
	PasswordResetKey         string    `db:"password_reset_key" json:"-"`
}

// Subscription ...
type Subscription struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	ID                 string    `db:"id" json:"id"`
	Level              string    `db:"level" json:"level"`
	NumberOfEditors    int       `db:"number_of_editors" json:"numberOfEditors"`
	FromDate           time.Time `db:"from_date" json:"fromDate"`
	ExpirationDate     time.Time `db:"expiration_date" json:"expirationDate"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	ExternalCustomerID string    `db:"external_customer_id" json:"-"`
	ExternalPlanID     string    `db:"external_plan_id" json:"-"`
	ExternalStatus     string    `db:"external_status" json:"externalStatus"`
}

// Member ...
type Member struct {
	ID          string    `db:"id" json:"id"`
	WorkspaceID string    `db:"workspace_id" json:"workspaceId"`
	AccountID   string    `db:"account_id" json:"accountId"`
	Level       string    `db:"level" json:"level"`
	Name        string    `db:"name" json:"name"`   // Joined in
	Email       string    `db:"email" json:"email"` // Joined in
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
}

// Invite ...
type Invite struct {
	WorkspaceID    string    `db:"workspace_id" json:"workspaceId"`
	ID             string    `db:"id" json:"id"`
	Email          string    `db:"email" json:"email"`
	Level          string    `db:"level" json:"level"`
	Code           string    `db:"code" json:"code"`
	CreatedBy      string    `db:"created_by" json:"createdBy"`
	CreatedByName  string    `db:"created_by_name" json:"createdByName"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	CreatedByEmail string    `db:"created_by_email" json:"createdByEmail"`
	WorkspaceName  string    `db:"workspace_name" json:"workspaceName"`
}

// Project ...
type Project struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	ID                 string    `db:"id" json:"id"`
	Title              string    `db:"title" json:"title"`
	Description        string    `db:"description" json:"description"`
	CreatedBy          string    `db:"created_by" json:"createdBy"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	ExternalLink       string    `db:"external_link" json:"externalLink"`
}

// Milestone ...
type Milestone struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	ProjectID          string    `db:"project_id" json:"projectId"`
	ID                 string    `db:"id" json:"id"`
	Title              string    `db:"title" json:"title"`
	Description        string    `db:"description" json:"description"`
	Status             string    `db:"status" json:"status"`
	Rank               string    `db:"rank" json:"rank"`
	CreatedBy          string    `db:"created_by" json:"createdBy"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	Color              string    `db:"color" json:"color"`
}

// Workflow ...
type Workflow struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	ProjectID          string    `db:"project_id" json:"projectId"`
	ID                 string    `db:"id" json:"id"`
	Title              string    `db:"title" json:"title"`
	Description        string    `db:"description" json:"description"`
	Rank               string    `db:"rank" json:"rank"`
	CreatedBy          string    `db:"created_by" json:"createdBy"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	Color              string    `db:"color" json:"color"`
}

// SubWorkflow ...
type SubWorkflow struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	WorkflowID         string    `db:"workflow_id" json:"workflowId"`
	ID                 string    `db:"id" json:"id"`
	Title              string    `db:"title" json:"title"`
	Description        string    `db:"description" json:"description"`
	Rank               string    `db:"rank" json:"rank"`
	CreatedBy          string    `db:"created_by" json:"createdBy"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	Color              string    `db:"color" json:"color"`
}

// Feature ...
type Feature struct {
	WorkspaceID        string    `db:"workspace_id" json:"workspaceId"`
	SubWorkflowID      string    `db:"subworkflow_id" json:"subWorkflowId"`
	MilestoneID        string    `db:"milestone_id" json:"milestoneId"`
	ID                 string    `db:"id" json:"id"`
	Title              string    `db:"title" json:"title"`
	Rank               string    `db:"rank" json:"rank"`
	Description        string    `db:"description" json:"description"`
	Status             string    `db:"status" json:"status"`
	CreatedBy          string    `db:"created_by" json:"createdBy"`
	CreatedByName      string    `db:"created_by_name" json:"createdByName"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	LastModified       time.Time `db:"last_modified" json:"lastModified"`
	LastModifiedByName string    `db:"last_modified_by_name" json:"lastModifiedByName"`
	Color              string    `db:"color" json:"color"`
}
