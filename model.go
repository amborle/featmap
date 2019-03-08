package main

import "time"

// Tenant ...
type Tenant struct {
	ID        string    `db:"id" json:"tenant"`
	Name      string    `db:"name" json:"name"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// Account ...
type Account struct {
	TenantID  string    `db:"tenant_id" json:"tenantId"`
	ID        string    `db:"id" json:"id"`
	Email     string    `db:"email" json:"email"`
	Password  string    `db:"password" json:"password"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// Project ...
type Project struct {
	TenantID  string    `db:"tenant_id" json:"tenantId"`
	ID        string    `db:"id" json:"id"`
	Title     string    `db:"title" json:"title"`
	CreatedBy string    `db:"created_by" json:"createdBy"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// Milestone ...
type Milestone struct {
	TenantID  string    `db:"tenant_id" json:"tenantId"`
	ProjectID string    `db:"project_id" json:"projectId"`
	ID        string    `db:"id" json:"id"`
	Title     string    `db:"title" json:"title"`
	Index     int       `db:"index" json:"index"`
	CreatedBy string    `db:"created_by" json:"createdBy"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// Workflow ...
type Workflow struct {
	TenantID  string    `db:"tenant_id" json:"tenantId"`
	ProjectID string    `db:"project_id" json:"projectId"`
	ID        string    `db:"id" json:"id"`
	Title     string    `db:"title" json:"title"`
	Index     int       `db:"index" json:"index"`
	CreatedBy string    `db:"created_by" json:"createdBy"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// SubWorkflow ...
type SubWorkflow struct {
	TenantID   string    `db:"tenant_id" json:"tenantId"`
	WorkflowID string    `db:"workflow_id" json:"workflowId"`
	ID         string    `db:"id" json:"id"`
	Title      string    `db:"title" json:"title"`
	Index      int       `db:"index" json:"index"`
	CreatedBy  string    `db:"created_by" json:"createdBy"`
	CreatedAt  time.Time `db:"created_at" json:"createdAt"`
}

// Feature ...
type Feature struct {
	TenantID      string    `db:"tenant_id" json:"tenantId"`
	SubWorkflowID string    `db:"subworkflow_id" json:"subWorkflowId"`
	MilestoneID   string    `db:"milestone_id" json:"mileStoneId"`
	ID            string    `db:"id" json:"id"`
	Title         string    `db:"title" json:"title"`
	Index         int       `db:"index" json:"index"`
	Description   string    `db:"description" json:"description"`
	CreatedBy     string    `db:"created_by" json:"createdBy"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
}
