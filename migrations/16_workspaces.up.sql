ALTER TABLE workspaces
    ADD COLUMN eu_vat varchar not null default '',
    ADD COLUMN external_customer_id varchar not null default '',
    ADD COLUMN external_billing_email varchar not null default '';