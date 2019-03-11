CREATE TABLE accounts (
	id uuid NOT NULL,
	email varchar NOT NULL,
	password varchar NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE not null,
	CONSTRAINT "PK_accounts_1" PRIMARY KEY (id),
	CONSTRAINT "UN_accounts_1" UNIQUE (email)	
)
WITH (
	OIDS=FALSE
) ;