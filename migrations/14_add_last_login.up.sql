ALTER TABLE accounts ADD latest_activity timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;
