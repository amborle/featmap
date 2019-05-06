ALTER TABLE subscriptions
ADD COLUMN external_customer_id varchar not null default '',
ADD COLUMN external_plan_id varchar not null default '',
ADD COLUMN external_status varchar not null default '';
