package model

// Tenant ...
type Tenant struct {
	ID        string `db:"id" json:"tenant"`
	Name      string `db:"name" json:"name"`
	CreatedAt string `db:"created_at" json:"createdAt"`
}

// Account ...
type Account struct {
	TenantID  string `db:"tenant_id" json:"tenantId"`
	ID        string `db:"id" json:"id"`
	Email     string `db:"email" json:"email"`
	Password  string `db:"password" json:"password"`
	CreatedAt string `db:"created_at" json:"createdAt"`
}

// Project ...
type Project struct {
	TenantID  string `db:"tenant_id" json:"tenantId"`
	ID        string `db:"id" json:"id"`
	Title     string `db:"title" json:"title"`
	CreatedBy string `db:"created_by" json:"createdBy"`
	CreatedAt string `db:"created_at" json:"createdAt"`
}

// Milestone ...
type Milestone struct {
	TenantID  string `db:"tenant_id" json:"tenantId"`
	ProjectID string `db:"project_id" json:"projectId"`
	ID        string `db:"id" json:"id"`
	Title     string `db:"title" json:"title"`
	Index     string `db:"index" json:"index"`
	CreatedBy string `db:"created_by" json:"createdBy"`
	CreatedAt string `db:"created_at" json:"createdAt"`
}

// Workflow ...
type Workflow struct {
	TenantID  string `db:"tenant_id" json:"tenantId"`
	ProjectID string `db:"project_id" json:"projectId"`
	ID        string `db:"id" json:"id"`
	Title     string `db:"title" json:"title"`
	Index     string `db:"index" json:"index"`
	CreatedBy string `db:"created_by" json:"createdBy"`
	CreatedAt string `db:"created_at" json:"createdAt"`
}

// SubWorkflow ...
type SubWorkflow struct {
	TenantID   string `db:"tenant_id" json:"tenantId"`
	WorkflowID string `db:"workflow_id" json:"workflowId"`
	ID         string `db:"id" json:"id"`
	Title      string `db:"title" json:"title"`
	Index      string `db:"index" json:"index"`
	CreatedBy  string `db:"created_by" json:"createdBy"`
	CreatedAt  string `db:"created_at" json:"createdAt"`
}

// Feature ...
type Feature struct {
	TenantID      string `db:"tenant_id" json:"tenantId"`
	SubWorkflowID string `db:"subworkflow_id" json:"subWorkflowId"`
	ID            string `db:"id" json:"id"`
	Title         string `db:"title" json:"title"`
	Index         string `db:"index" json:"index"`
	Description   string `db:"description" json:"description"`
	CreatedBy     string `db:"created_by" json:"createdBy"`
	CreatedAt     string `db:"created_at" json:"createdAt"`
}

// Portfolio ...
type Portfolio struct {
	TenantID string `db:"tenant_id" json:"tenantId"`
	ID       string `db:"id" json:"id"`
	Name     string `db:"name" json:"name"`
	Currency string `db:"currency" json:"currency"`
}

// Security ...
type Security struct {
	TenantID string `db:"tenant_id" json:"tenantId"`
	ID       string `db:"id" json:"id"`
	Name     string `db:"name" json:"name"`
	Currency string `db:"currency" json:"currency"`
}

// Holding ...
type Holding struct {
	TenantID    string `db:"tenant_id" json:"tenantId"`
	PortfolioID string `db:"portfolio_id" json:"portfolioId"`
	ID          string `db:"id" json:"id"`
	Type        string `db:"type" json:"type"`
	Identifier  string `db:"identifier" json:"identifier"`
	Name        string `db:"name" json:"name"`
	Currency    string `db:"currency" json:"currency"`
}

// Transaction ...
type Transaction struct {
	TenantID    string `db:"tenant_id" json:"tenantId"`
	ID          string `db:"id" json:"id"`
	PortfolioID string `db:"portfolio_id" json:"portfolioId"`
	HoldingID   string `db:"holding_id" json:"holdingId"`
	Trans       string `db:"trans" json:"trans"`
}

// Currency ...
type Currency struct {
	ID string `db:"id" json:"id"`
}
