CREATE TABLE subworkflows (
	tenant_id varchar NOT NULL,
	workflow_id varchar NOT NULL, 
	id varchar NOT NULL,	
	index varchar not null,	
	title varchar NOT NULL,	
	created_by varchar,
	created_at TIMESTAMP WITH TIME ZONE not null,			
	CONSTRAINT "PK_subworkflows" PRIMARY KEY (tenant_id,id),
	CONSTRAINT "UN_subworkflows" UNIQUE (tenant_id,workflow_id, index),
	CONSTRAINT "FK_subworkflows_1" FOREIGN KEY (tenant_id, workflow_id) REFERENCES workflows(tenant_id, id) ON DELETE CASCADE,
	CONSTRAINT "FK_subworkflows_2" FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL		
)
WITH (
	OIDS=FALSE
) ;
