-- public.feature_comments definition

-- Drop table

-- DROP TABLE public.feature_comments;

CREATE TABLE public.feature_comments (
	id uuid NOT NULL,
	workspace_id uuid NOT NULL,
	post varchar NOT NULL,
	created_at timestamptz NOT NULL,
	created_by_name varchar NOT NULL,
	last_modified timestamptz NOT NULL,
	feature_id uuid NOT NULL,
	project_id uuid NOT NULL,
	CONSTRAINT feature_comments_pk PRIMARY KEY (workspace_id, id)
);
CREATE INDEX feature_comments_workspace_id_idx ON public.feature_comments USING btree (workspace_id, feature_id);
CREATE INDEX feature_comments_workspace_id_idx2 ON public.feature_comments USING btree (workspace_id, project_id);


-- public.feature_comments foreign keys

ALTER TABLE public.feature_comments ADD CONSTRAINT feature_comments_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.feature_comments ADD CONSTRAINT feature_comments_fk2 FOREIGN KEY (workspace_id, feature_id) REFERENCES features(workspace_id, id) ON DELETE CASCADE;
ALTER TABLE public.feature_comments ADD CONSTRAINT feature_comments_fk3 FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE;