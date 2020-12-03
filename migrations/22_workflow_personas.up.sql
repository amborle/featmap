CREATE TABLE public.workflow_personas (
	workspace_id uuid NOT NULL,
	project_id uuid NOT NULL,
	workflow_id uuid NOT NULL,
	id uuid NOT NULL,
	persona_id uuid NOT NULL,
	CONSTRAINT workflow_personas_pk PRIMARY KEY (workspace_id,id),
	CONSTRAINT workflow_personas_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE,
	CONSTRAINT workflow_personas_fk_1 FOREIGN KEY (workspace_id,project_id) REFERENCES public.projects(workspace_id,id) ON DELETE CASCADE,
	CONSTRAINT workflow_personas_fk_2 FOREIGN KEY (workspace_id,workflow_id) REFERENCES public.workflows(workspace_id,id) ON DELETE CASCADE,
	CONSTRAINT workflow_personas_fk_3 FOREIGN KEY (workspace_id,persona_id) REFERENCES public.personas(workspace_id,id) ON DELETE CASCADE
);
CREATE INDEX workflow_personas_workspace_id_idx ON public.workflow_personas (workspace_id,project_id);

ALTER TABLE public.workflow_personas ADD CONSTRAINT workflow_personas_un UNIQUE (workspace_id,workflow_id,persona_id);
