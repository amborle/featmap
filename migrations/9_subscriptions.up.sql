CREATE TABLE subscriptions (
	workspace_id uuid NOT NULL,
	id uuid NOT NULL,		
	level int NOT NULL,	
	number_of_editors int NOT NULL,
	from_date DATE NOT NULL,  	
	created_by_name varchar NOT NULL,	
	created_at TIMESTAMP WITH TIME ZONE not null,			
	last_modified TIMESTAMP WITH TIME ZONE not null,		
	last_modified_by_name varchar not null,				
	CONSTRAINT "PK_subscriptions" PRIMARY KEY (workspace_id,id),
	CONSTRAINT "UN_subscriptions_1" UNIQUE (workspace_id,id,from_date),	
	CONSTRAINT "FK_subscriptions_1" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE	
)
WITH (
	OIDS=FALSE
) ;
