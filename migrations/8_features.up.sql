CREATE TABLE features (
	workspace_id uuid NOT NULL,
	subworkflow_id uuid NOT NULL, 
	milestone_id uuid NOT NULL, 
	id uuid NOT NULL,	
	rank varchar not null,	
	title varchar not null,	
	"description" varchar not null,	
	created_by uuid,
	created_by_name varchar NOT NULL,	
	created_at TIMESTAMP WITH TIME ZONE not null,			
	CONSTRAINT "PK_features" PRIMARY KEY (workspace_id,id),
	CONSTRAINT "FK_features_1" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
	CONSTRAINT "FK_features_2" FOREIGN KEY (workspace_id, subworkflow_id) REFERENCES subworkflows(workspace_id, id) ON DELETE CASCADE,
	CONSTRAINT "FK_features_3" FOREIGN KEY (workspace_id, milestone_id) REFERENCES milestones(workspace_id, id) ON DELETE CASCADE,	
	CONSTRAINT "FK_features_4" FOREIGN KEY (workspace_id,created_by) REFERENCES members(workspace_id, id) ON DELETE SET NULL	
)
WITH (
	OIDS=FALSE
) ;
