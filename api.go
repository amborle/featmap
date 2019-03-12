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
				r.Route("/projects/{ID}", func(r chi.Router) {
					r.Post("/projects", createProject)
					r.Get("/", getProjectExtended)
					r.Put("/rename", renameProject)
					r.Delete("/", deleteProject)
				})

				r.Post("/milestones", createMilestone)
				r.Route("/milestones/{ID}", func(r chi.Router) {
					r.Put("/rename", renameMilestone)
					r.Delete("/", deleteMilestone)
				})

				r.Post("/workflows", createWorkflow)
				r.Route("/workflows/{ID}", func(r chi.Router) {
					r.Put("/rename", renameWorkflow)
					r.Delete("/", deleteWorkflow)
				})

				r.Post("/subworkflows", createSubWorkflow)
				r.Route("/subworkflows/{ID}", func(r chi.Router) {
					r.Put("/rename", renameSubWorkflow)
					r.Delete("/", deleteSubWorkflow)
				})

				r.Post("/features", createFeature)
				r.Route("/features/{ID}", func(r chi.Router) {
					r.Put("/rename", renameFeature)
					r.Delete("/", deleteFeature)
				})
			})
	})
}

// Projects
type createProjectRequest struct {
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

	id := chi.URLParam(r, "ID")
	s := GetEnv(r).Service
	if _, err := s.CreateProjectWithID(id, data.Title); err != nil {
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
	id := chi.URLParam(r, "ID")

	project := s.GetProject(id)
	milestones := s.GetMilestonesByProject(id)
	workflows := s.GetWorkflowsByProject(id)
	oo := response{
		Project:    project,
		Milestones: milestones,
		Workflows:  workflows,
	}

	render.JSON(w, r, oo)
}

func getProjects(w http.ResponseWriter, r *http.Request) {
	s := GetEnv(r).Service
	render.JSON(w, r, s.GetProjects())
}

func renameProject(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	if _, err := GetEnv(r).Service.RenameProject(id, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func deleteProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

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

func renameMilestone(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	if _, err := GetEnv(r).Service.RenameMilestone(id, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func deleteMilestone(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

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

func renameWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	if _, err := GetEnv(r).Service.RenameWorkflow(id, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func deleteWorkflow(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

	if err := GetEnv(r).Service.DeleteWorkflow(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

// SubWorkflows

type createSubWorkflowRequest struct {
	ID         string `json:"id"`
	WorkflowID string `json:"workflowId"`
	Title      string `json:"title"`
}

func (p *createSubWorkflowRequest) Bind(r *http.Request) error {
	return nil
}

func createSubWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &createSubWorkflowRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	if _, err := GetEnv(r).Service.CreateSubWorkflowWithID(data.ID, data.WorkflowID, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func renameSubWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	if _, err := GetEnv(r).Service.RenameSubWorkflow(id, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func deleteSubWorkflow(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

	if err := GetEnv(r).Service.DeleteSubWorkflow(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

// Features

type createFeatureRequest struct {
	ID            string `json:"id"`
	SubWorkflowID string `json:"subWorkflowId"`
	MilestoneID   string `json:"milestoneId"`
	Title         string `json:"title"`
}

func (p *createFeatureRequest) Bind(r *http.Request) error {
	return nil
}

func createFeature(w http.ResponseWriter, r *http.Request) {
	data := &createFeatureRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	if _, err := GetEnv(r).Service.CreateFeatureWithID(data.ID, data.SubWorkflowID, data.MilestoneID, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func renameFeature(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	if _, err := GetEnv(r).Service.RenameFeature(id, data.Title); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

func deleteFeature(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

	if err := GetEnv(r).Service.DeleteFeature(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

// Common

type renameRequest struct {
	Title string `json:"title"`
}

func (p *renameRequest) Bind(r *http.Request) error {
	return nil
}
