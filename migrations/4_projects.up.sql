CREATE TABLE projects (
	workspace_id uuid NOT NULL,
	id uuid NOT NULL,
	title varchar NOT NULL,
	created_by uuid,
	created_at TIMESTAMP WITH TIME ZONE not null,			
	CONSTRAINT "PK_projects_1" PRIMARY KEY (workspace_id,id),
	CONSTRAINT "FK_projects_1" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT "FK_projects_2" FOREIGN KEY (workspace_id,created_by) REFERENCES members(workspace_id, id) ON DELETE SET NULL		
)
WITH (
	OIDS=FALSE
) ;
