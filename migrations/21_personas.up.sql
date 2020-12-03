CREATE TABLE public.personas (
	workspace_id uuid NOT NULL,
	project_id uuid NOT NULL,
	id uuid NOT NULL,
	"name" varchar NOT NULL,
	"role" varchar NOT NULL,
	avatar varchar NOT NULL,
	description varchar NOT NULL,
	created_at timestamptz NOT NULL,
	CONSTRAINT personas_pk PRIMARY KEY (workspace_id,id),
	CONSTRAINT personas_fk_1 FOREIGN KEY (workspace_id,project_id) REFERENCES public.projects(workspace_id,id) ON DELETE CASCADE,
	CONSTRAINT personas_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE
);
CREATE INDEX personas_workspace_id_idx ON public.personas (workspace_id,project_id);
