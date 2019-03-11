CREATE TABLE members (
	id uuid NOT NULL,
	tenant_id uuid NOT NULL,
	account_id uuid NOT NULL,	
	CONSTRAINT "PK_members_1" PRIMARY KEY (id),
	CONSTRAINT "FK_members_1" FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
	CONSTRAINT "FK_members_2" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
	CONSTRAINT "UN_members_1" UNIQUE (tenant_id,account_id)	
)
WITH (
	OIDS=FALSE
) ;