ALTER TABLE public.features ADD annotations varchar NOT NULL DEFAULT '';
ALTER TABLE public.milestones ADD annotations varchar NOT NULL DEFAULT '';
ALTER TABLE public.workflows ADD annotations varchar NOT NULL DEFAULT '';
ALTER TABLE public.subworkflows ADD annotations varchar NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD annotations varchar NOT NULL DEFAULT '';