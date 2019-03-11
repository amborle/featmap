package main

import (
	"github.com/go-chi/render"

	"net/http"

	"github.com/go-chi/chi"
)

func api(r chi.Router) {
	r.Use(RequireMember())

	r.Group(func(r chi.Router) {
		r.Route("/",

			func(r chi.Router) {

				r.Get("/projects", getProjects)
				r.Post("/projects", createProject)
				r.Route("/projects/{PROJECTID}", func(r chi.Router) {
					r.Get("/", getProjectExtended)
					r.Put("/", updateProject)
					r.Delete("/", deleteProject)
				})

				r.Post("/milestones", createMilestone)
				r.Route("/milestones/{MILESTONEID}", func(r chi.Router) {
					r.Put("/", updateMilestone)
					r.Delete("/", deleteMilestone)
				})
			})
	})
}

// Projects
type createProjectRequest struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

func (p *createProjectRequest) Bind(r *http.Request) error {
	return nil
}
func createProject(w http.ResponseWriter, r *http.Request) {
	data := &createProjectRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	s := GetEnv(r).Service
	if _, err := s.CreateProjectWithID(data.ID, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func getProjectExtended(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Project      *Project       `json:"project"`
		Milestones   []*Milestone   `json:"milestones"`
		Workflows    []*Workflow    `json:"workflows"`
		SubWorkflows []*SubWorkflow `json:"subWorkflows"`
		Features     []*Feature     `json:"features"`
	}

	s := GetEnv(r).Service
	id := chi.URLParam(r, "PROJECTID")

	project := s.GetProject(id)
	milestones := s.GetMilestonesByProject(id)
	oo := response{
		Project:    project,
		Milestones: milestones,
	}

	render.JSON(w, r, oo)
}

func getProjects(w http.ResponseWriter, r *http.Request) {
	s := GetEnv(r).Service
	render.JSON(w, r, s.GetProjects())
}

type updateProjectRequest struct {
	Title string `json:"title"`
}

func (p *updateProjectRequest) Bind(r *http.Request) error {
	return nil
}

func updateProject(w http.ResponseWriter, r *http.Request) {
	data := &updateMilestoneRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "PROJECTID")

	if _, err := GetEnv(r).Service.RenameProject(id, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func deleteProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "PROJECTID")

	if err := GetEnv(r).Service.DeleteProject(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

// Milestones

type createMilestoneRequest struct {
	ID        string `json:"id"`
	ProjectID string `json:"projectId"`
	Title     string `json:"title"`
}

func (p *createMilestoneRequest) Bind(r *http.Request) error {
	return nil
}

func createMilestone(w http.ResponseWriter, r *http.Request) {
	data := &createMilestoneRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	if _, err := GetEnv(r).Service.CreateMilestoneWithID(data.ID, data.ProjectID, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

type updateMilestoneRequest struct {
	Title string `json:"title"`
}

func (p *updateMilestoneRequest) Bind(r *http.Request) error {
	return nil
}

func updateMilestone(w http.ResponseWriter, r *http.Request) {
	data := &updateMilestoneRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "MILESTONEID")

	if _, err := GetEnv(r).Service.RenameMilestone(id, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func deleteMilestone(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "MILESTONEID")

	if err := GetEnv(r).Service.DeleteMilestone(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

// Workflows

type createWorkflowRequest struct {
	ID        string `json:"id"`
	ProjectID string `json:"projectId"`
	Title     string `json:"title"`
}

func (p *createWorkflowRequest) Bind(r *http.Request) error {
	return nil
}

func createWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &createWorkflowRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	if _, err := GetEnv(r).Service.CreateWorkflowWithID(data.ID, data.ProjectID, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}
