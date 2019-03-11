CREATE TABLE members (
	workspace_id uuid NOT NULL,
	id uuid NOT NULL,
	account_id uuid NOT NULL,	
	CONSTRAINT "PK_members_1" PRIMARY KEY (workspace_id,id),
	CONSTRAINT "FK_members_1" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT "FK_members_2" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
	CONSTRAINT "UN_members_1" UNIQUE (workspace_id,account_id)	
)
WITH (
	OIDS=FALSE
) ;