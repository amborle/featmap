ALTER TABLE workspaces
ADD COLUMN is_company boolean not null default true,
ADD COLUMN eu_vat varchar not null default '',
ADD COLUMN country varchar not null default '';
