CREATE TABLE members (
	id varchar NOT NULL,
	tenant_id varchar NOT NULL,
	account_id varchar NOT NULL,	
	CONSTRAINT "PK_members_1" PRIMARY KEY (id),
	CONSTRAINT "FK_members_1" FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
	CONSTRAINT "FK_members_2" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
	CONSTRAINT "UN_members_1" UNIQUE (tenant_id,account_id)	
)
WITH (
	OIDS=FALSE
) ;