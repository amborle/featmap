CREATE TABLE workspaces
(
    id                     uuid                     NOT NULL,
    "name"                 varchar                  NOT NULL,
    created_at             TIMESTAMP WITH TIME ZONE not null,
    allow_external_sharing boolean                  not null,
    CONSTRAINT "PK_workspaces_1" PRIMARY KEY (id),
    CONSTRAINT "UN_workspaces" UNIQUE ("name")
)
    WITH (
        OIDS= FALSE
    );
