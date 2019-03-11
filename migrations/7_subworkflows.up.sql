CREATE TABLE subworkflows (
	workspace_id uuid NOT NULL,
	workflow_id uuid NOT NULL, 
	id uuid NOT NULL,	
	index varchar not null,	
	title varchar NOT NULL,	
	created_by uuid,
	created_at TIMESTAMP WITH TIME ZONE not null,			
	CONSTRAINT "PK_subworkflows" PRIMARY KEY (workspace_id,id),
	CONSTRAINT "FK_subworkflows_1" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT "FK_subworkflows_2" FOREIGN KEY (workspace_id, workflow_id) REFERENCES workflows(workspace_id, id) ON DELETE CASCADE,
	CONSTRAINT "FK_subworkflows_3" FOREIGN KEY (workspace_id,created_by) REFERENCES members(workspace_id, id) ON DELETE SET NULL	
)
WITH (
	OIDS=FALSE
) ;
