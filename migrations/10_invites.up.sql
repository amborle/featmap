CREATE TABLE invites (
	workspace_id uuid NOT NULL,
	id uuid NOT NULL,		
	email varchar NOT NULL,	
	level int NOT NULL,
	code uuid not null,
	created_by uuid,
	created_by_name varchar NOT NULL,	
	created_at TIMESTAMP WITH TIME ZONE not null,					
	created_by_email varchar NOT NULL,	
	workspace_name varchar NOT NULL,	
	CONSTRAINT "PK_invites" PRIMARY KEY (workspace_id,id),
	CONSTRAINT "UN_invites_1" UNIQUE (workspace_id,email),	
	CONSTRAINT "UN_invites_2" UNIQUE (code),	
	CONSTRAINT "FK_invites_1" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,	
	CONSTRAINT "FK_invites_2" FOREIGN KEY (workspace_id,created_by) REFERENCES members(workspace_id, id) ON DELETE CASCADE	
)
WITH (
	OIDS=FALSE
) ;
