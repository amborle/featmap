CREATE TABLE projects (
	workspace_id uuid NOT NULL,
	id uuid NOT NULL,
	title varchar NOT NULL,
	"description" varchar not null,	
	created_by uuid,
	created_by_name varchar NOT NULL,	
	created_at TIMESTAMP WITH TIME ZONE not null,
	last_modified TIMESTAMP WITH TIME ZONE not null,			
	last_modified_by_name varchar not null,				 		
	external_link uuid NOT NULL,				 		
	CONSTRAINT "PK_projects_1" PRIMARY KEY (workspace_id,id),
	CONSTRAINT "UN_projects_1" UNIQUE (external_link),	
	CONSTRAINT "FK_projects_1" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT "FK_projects_2" FOREIGN KEY (workspace_id,created_by) REFERENCES members(workspace_id, id) ON DELETE SET NULL		
)
WITH (
	OIDS=FALSE
) ;
