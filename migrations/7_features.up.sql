CREATE TABLE features (
	tenant_id varchar NOT NULL,
	subworkflow_id varchar NOT NULL, 
	milestone_id varchar NOT NULL, 
	id varchar NOT NULL,	
	index bigint not null,	
	title varchar,	
	"description" varchar,	
	created_by varchar,
	created_at TIMESTAMP WITH TIME ZONE not null,			
	CONSTRAINT "PK_features" PRIMARY KEY (tenant_id,id),
	CONSTRAINT "UN_features" UNIQUE (tenant_id,subworkflow_id,milestone_id, index),
	CONSTRAINT "FK_features_1" FOREIGN KEY (tenant_id, subworkflow_id) REFERENCES subworkflows(tenant_id, id) ON DELETE CASCADE,
	CONSTRAINT "FK_features_2" FOREIGN KEY (tenant_id, milestone_id) REFERENCES milestones(tenant_id, id) ON DELETE CASCADE,
	CONSTRAINT "FK_features_3" FOREIGN KEY (tenant_id, created_by) REFERENCES accounts(tenant_id, id) ON DELETE SET NULL		
)
WITH (
	OIDS=FALSE
) ;
