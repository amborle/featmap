CREATE TABLE accounts (
	tenant_id varchar NOT NULL,
	id varchar NOT NULL,
	email varchar NOT NULL,
	password varchar NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE not null,
	CONSTRAINT "PK_accounts_1" PRIMARY KEY (tenant_id,id),
	CONSTRAINT "UN_accounts_1" UNIQUE (email),
	CONSTRAINT "FK_accounts_1" FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
)
WITH (
	OIDS=FALSE
) ;