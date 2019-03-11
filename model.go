package main

import "time"

// Workspace ...
type Workspace struct {
	ID        string    `db:"id" json:"workspace"`
	Name      string    `db:"name" json:"name"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// Account ...
type Account struct {
	ID        string    `db:"id" json:"id"`
	Email     string    `db:"email" json:"email"`
	Password  string    `db:"password" json:"password"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// Member ...
type Member struct {
	ID          string `db:"id" json:"id"`
	WorkspaceID string `db:"workspace_id" json:"workspaceId"`
	AccountID   string `db:"account_id" json:"accountId"`
}

// Project ...
type Project struct {
	WorkspaceID string    `db:"workspace_id" json:"workspaceId"`
	ID          string    `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	CreatedBy   string    `db:"created_by" json:"createdBy"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
}

// Milestone ...
type Milestone struct {
	WorkspaceID string    `db:"workspace_id" json:"workspaceId"`
	ProjectID   string    `db:"project_id" json:"projectId"`
	ID          string    `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	Index       string    `db:"index" json:"index"`
	CreatedBy   string    `db:"created_by" json:"createdBy"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
}

// Workflow ...
type Workflow struct {
	WorkspaceID string    `db:"workspace_id" json:"workspaceId"`
	ProjectID   string    `db:"project_id" json:"projectId"`
	ID          string    `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	Index       string    `db:"index" json:"index"`
	CreatedBy   string    `db:"created_by" json:"createdBy"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
}

// SubWorkflow ...
type SubWorkflow struct {
	WorkspaceID string    `db:"workspace_id" json:"workspaceId"`
	WorkflowID  string    `db:"workflow_id" json:"workflowId"`
	ID          string    `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	Index       string    `db:"index" json:"index"`
	CreatedBy   string    `db:"created_by" json:"createdBy"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
}

// Feature ...
type Feature struct {
	WorkspaceID   string    `db:"workspace_id" json:"workspaceId"`
	SubWorkflowID string    `db:"subworkflow_id" json:"subWorkflowId"`
	MilestoneID   string    `db:"milestone_id" json:"mileStoneId"`
	ID            string    `db:"id" json:"id"`
	Title         string    `db:"title" json:"title"`
	Index         string    `db:"index" json:"index"`
	Description   string    `db:"description" json:"description"`
	CreatedBy     string    `db:"created_by" json:"createdBy"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
}
