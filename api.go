package main

import (
	"github.com/go-chi/render"

	"net/http"

	"github.com/go-chi/chi"
)

func api(r chi.Router) {

	r.Use(RequireAccount())
	r.Get("/app", getApp)

	r.Group(func(r chi.Router) {
		r.Use(RequireMember())
		r.Route("/",
			func(r chi.Router) {

				r.Get("/projects", getProjects)
				r.Route("/projects/{ID}", func(r chi.Router) {
					r.Post("/", createProject)
					r.Get("/", getProjectExtended)
					r.Delete("/", deleteProject)
					r.Put("/rename", renameProject)
				})

				r.Route("/milestones/{ID}", func(r chi.Router) {
					r.Post("/", createMilestone)
					r.Delete("/", deleteMilestone)
					r.Put("/rename", renameMilestone)
				})

				r.Route("/milestones/{ID}/move", func(r chi.Router) {
					r.Post("/", moveMilestone)
				})

				r.Route("/workflows/{ID}", func(r chi.Router) {
					r.Post("/", createWorkflow)
					r.Delete("/", deleteWorkflow)
					r.Put("/rename", renameWorkflow)
				})

				r.Route("/subworkflows/{ID}", func(r chi.Router) {
					r.Post("/", createSubWorkflow)
					r.Put("/rename", renameSubWorkflow)
					r.Delete("/", deleteSubWorkflow)
				})

				r.Route("/features/{ID}", func(r chi.Router) {
					r.Post("/", createFeature)
					r.Put("/rename", renameFeature)
					r.Delete("/", deleteFeature)
				})
			})
	})
}

// Workspaces
func getApp(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Account     *Account     `json:"account"`
		Workspaces  []*Workspace `json:"workspaces"`
		Memberships []*Member    `json:"memberships"`
	}

	s := GetEnv(r).Service
	render.JSON(w, r, response{
		Account:     s.GetAccountObject(),
		Workspaces:  s.GetWorkspaces(),
		Memberships: s.GetMembers(),
	})
}

func getWorkspaceExtended(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Workspace *Workspace `json:"workspace"`
		Projects  []*Project `json:"projects"`
	}

	s := GetEnv(r).Service
	render.JSON(w, r, response{
		Workspace: s.GetWorkspaceByContext(),
		Projects:  s.GetProjects(),
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
	p, err := s.CreateProjectWithID(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, p)
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
	subworkflows := s.GetSubWorkflowsByProject(id)
	features := s.GetFeaturesByProject(id)
	oo := response{
		Project:      project,
		Milestones:   milestones,
		Workflows:    workflows,
		SubWorkflows: subworkflows,
		Features:     features,
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
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.CreateMilestoneWithID(id, data.ProjectID, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
}

type moveMilestoneRequest struct {
	Index int `json:"index"`
}

func (p *moveMilestoneRequest) Bind(r *http.Request) error {
	return nil
}

func moveMilestone(w http.ResponseWriter, r *http.Request) {

	data := &moveMilestoneRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.MoveMilestone(id, data.Index)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
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
	id := chi.URLParam(r, "ID")
	if _, err := GetEnv(r).Service.CreateWorkflowWithID(id, data.ProjectID, data.Title); err != nil {
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

	id := chi.URLParam(r, "ID")
	if _, err := GetEnv(r).Service.CreateSubWorkflowWithID(id, data.WorkflowID, data.Title); err != nil {
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

	id := chi.URLParam(r, "ID")
	if _, err := GetEnv(r).Service.CreateFeatureWithID(id, data.SubWorkflowID, data.MilestoneID, data.Title); err != nil {
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
