CREATE TABLE accounts
(
    id                         uuid                     NOT NULL,
    name                       varchar                  NOT NULL,
    email                      varchar                  NOT NULL,
    password                   varchar                  NOT NULL,
    created_at                 TIMESTAMP WITH TIME ZONE NOT NULL,
    email_confirmed            boolean                  NOT NULL,
    email_confirmation_sent_to varchar                  NOT NULL,
    email_confirmation_key     uuid                     NOT NULL,
    email_confirmation_pending boolean                  NOT NULL,
    password_reset_key         uuid                     NOT NULL,
    CONSTRAINT "PK_accounts_1" PRIMARY KEY (id),
    CONSTRAINT "UN_accounts_1" UNIQUE (email),
    CONSTRAINT "UN_accounts_2" UNIQUE (email_confirmation_key),
    CONSTRAINT "UN_accounts_3" UNIQUE (password_reset_key)
)
    WITH (
        OIDS= FALSE
    );