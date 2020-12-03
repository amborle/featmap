
CREATE TABLE public.feature_comment_owners (
	workspace_id uuid NOT NULL,
	id uuid NOT NULL,
	feature_comment_id uuid NOT NULL,
	member_id uuid NOT NULL,
	project_id uuid NOT NULL,
	CONSTRAINT feature_comments_owner_pk PRIMARY KEY (workspace_id, id),
	CONSTRAINT feature_comments_owner_un UNIQUE (feature_comment_id, workspace_id),
	CONSTRAINT feature_comments_owner_fk_3 FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE
);
CREATE INDEX feature_comments_owner_workspace_id_idx ON public.feature_comment_owners USING btree (workspace_id, feature_comment_id);

ALTER TABLE public.feature_comment_owners ADD CONSTRAINT feature_comments_owner_fk FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.feature_comment_owners ADD CONSTRAINT feature_comments_owner_fk_1 FOREIGN KEY (workspace_id, member_id) REFERENCES members(workspace_id, id) ON DELETE CASCADE;
ALTER TABLE public.feature_comment_owners ADD CONSTRAINT feature_comments_owner_fk_2 FOREIGN KEY (workspace_id, feature_comment_id) REFERENCES feature_comments(workspace_id, id) ON DELETE CASCADE;
