CREATE TABLE tenants (
	id uuid NOT NULL,
	"name" varchar NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE not null,
	CONSTRAINT "PK_tenants_1" PRIMARY KEY (id),
	CONSTRAINT tenants_un UNIQUE ("name")
)
WITH (
	OIDS=FALSE
) ;
