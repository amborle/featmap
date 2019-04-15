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
		r.Post("/leave", leave)
	})

	r.Group(func(r chi.Router) {
		r.Use(RequireMember())
		r.Use(RequireAdmin())

		r.Get("/members", getMembers)
		r.Route("/members/{ID}", func(r chi.Router) {
			r.Post("/level", updateMemberLevel)
			r.Delete("/", deleteMember)
		})

		r.Get("/invites", getInvites)
		r.Post("/invites", createInvite)
		r.Route("/invites/{ID}", func(r chi.Router) {
			r.Delete("/", deleteInvite)
			r.Post("/resend", resendInvite)
		})

	})

	r.Group(func(r chi.Router) {
		r.Use(RequireMember())

		r.Route("/",
			func(r chi.Router) {

				r.Get("/projects", getProjects)

				r.Route("/projects/{ID}", func(r chi.Router) {

					r.Group(func(r chi.Router) {
						r.Get("/", getProjectExtended)
					})

					r.Group(func(r chi.Router) {
						r.Use(RequireEditor())
						r.Post("/", createProject)
						r.Delete("/", deleteProject)
						r.Post("/rename", renameProject)
						r.Post("/description", updateProjectDescription)
					})
				})

				r.Route("/milestones/{ID}", func(r chi.Router) {
					r.Use(RequireEditor())
					r.Post("/", createMilestone)
					r.Delete("/", deleteMilestone)
					r.Post("/rename", renameMilestone)
					r.Post("/move", moveMilestone)
					r.Post("/description", updateMilestoneDescription)
				})

				r.Route("/workflows/{ID}", func(r chi.Router) {
					r.Use(RequireEditor())
					r.Post("/", createWorkflow)
					r.Delete("/", deleteWorkflow)
					r.Post("/rename", renameWorkflow)
					r.Post("/move", moveWorkflow)
					r.Post("/description", updateWorkflowDescription)
				})

				r.Route("/subworkflows/{ID}", func(r chi.Router) {
					r.Use(RequireEditor())
					r.Post("/", createSubWorkflow)
					r.Post("/rename", renameSubWorkflow)
					r.Delete("/", deleteSubWorkflow)
					r.Post("/move", moveSubWorkflow)
					r.Post("/description", updateSubWorkflowDescription)
				})

				r.Route("/features/{ID}", func(r chi.Router) {
					r.Use(RequireEditor())
					r.Post("/", createFeature)
					r.Post("/rename", renameFeature)
					r.Delete("/", deleteFeature)
					r.Post("/move", moveFeature)
					r.Post("/description", updateFeatureDescription)
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
		Memberships: s.GetMembersByAccount(),
	})
}

func getMembers(w http.ResponseWriter, r *http.Request) {
	s := GetEnv(r).Service
	a := s.GetMembers()
	render.JSON(w, r, a)
}

type updateMemberLevelRequest struct {
	Level string `json:"level"`
}

func (p *updateMemberLevelRequest) Bind(r *http.Request) error {

	return nil
}

func updateMemberLevel(w http.ResponseWriter, r *http.Request) {
	data := &updateMemberLevelRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")
	m, err := GetEnv(r).Service.UpdateMemberLevel(id, data.Level)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
}

func deleteMember(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")
	err := GetEnv(r).Service.DeleteMember(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
}

func leave(w http.ResponseWriter, r *http.Request) {
	err := GetEnv(r).Service.Leave()
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
}

// Invites

func getInvites(w http.ResponseWriter, r *http.Request) {
	render.JSON(w, r, GetEnv(r).Service.GetInvitesByWorkspace())
}

type createInviteRequest struct {
	Email string `json:"email"`
	Level string `json:"level"`
}

func (p *createInviteRequest) Bind(r *http.Request) error {
	return nil
}

func createInvite(w http.ResponseWriter, r *http.Request) {
	data := &createInviteRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	_, err := GetEnv(r).Service.CreateInvite(data.Email, data.Level)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

}

func deleteInvite(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")
	err := GetEnv(r).Service.DeleteInvite(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
}

func resendInvite(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

	err := GetEnv(r).Service.SendInvitationMail(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
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

	p, err := GetEnv(r).Service.RenameProject(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, p)
}

func updateProjectDescription(w http.ResponseWriter, r *http.Request) {
	data := &updateDescriptionRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.UpdateProjectDescription(id, data.Description)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
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

	m, err := GetEnv(r).Service.RenameMilestone(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)

}

func updateMilestoneDescription(w http.ResponseWriter, r *http.Request) {
	data := &updateDescriptionRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.UpdateMilestoneDescription(id, data.Description)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
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
	wf, err := GetEnv(r).Service.CreateWorkflowWithID(id, data.ProjectID, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	render.JSON(w, r, wf)
}

func renameWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	wf, err := GetEnv(r).Service.RenameWorkflow(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, wf)

}

func deleteWorkflow(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

	if err := GetEnv(r).Service.DeleteWorkflow(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

type moveWorkflowRequest struct {
	Index int `json:"index"`
}

func (p *moveWorkflowRequest) Bind(r *http.Request) error {
	return nil
}

func moveWorkflow(w http.ResponseWriter, r *http.Request) {

	data := &moveWorkflowRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.MoveWorkflow(id, data.Index)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
}

func updateWorkflowDescription(w http.ResponseWriter, r *http.Request) {
	data := &updateDescriptionRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.UpdateWorkflowDescription(id, data.Description)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
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
	sw, err := GetEnv(r).Service.CreateSubWorkflowWithID(id, data.WorkflowID, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, sw)
}

func renameSubWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	sw, err := GetEnv(r).Service.RenameSubWorkflow(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, sw)

}

func updateSubWorkflowDescription(w http.ResponseWriter, r *http.Request) {
	data := &updateDescriptionRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")
	m, err := GetEnv(r).Service.UpdateSubWorkflowDescription(id, data.Description)

	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
}

func deleteSubWorkflow(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

	if err := GetEnv(r).Service.DeleteSubWorkflow(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

type moveSubWorkflowRequest struct {
	Index        int    `json:"index"`
	ToWorkflowID string `json:"toWorkflowId"`
}

func (p *moveSubWorkflowRequest) Bind(r *http.Request) error {
	return nil
}

func moveSubWorkflow(w http.ResponseWriter, r *http.Request) {

	data := &moveSubWorkflowRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.MoveSubWorkflow(id, data.ToWorkflowID, data.Index)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
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
	f, err := GetEnv(r).Service.CreateFeatureWithID(id, data.SubWorkflowID, data.MilestoneID, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func renameFeature(w http.ResponseWriter, r *http.Request) {
	data := &renameRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.RenameFeature(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func updateFeatureDescription(w http.ResponseWriter, r *http.Request) {
	data := &updateDescriptionRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.UpdateFeatureDescription(id, data.Description)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
}

func deleteFeature(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "ID")

	if err := GetEnv(r).Service.DeleteFeature(id); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.Status(r, http.StatusOK)
}

type moveFeatureRequest struct {
	Index           int    `json:"index"`
	ToSubWorkflowID string `json:"toSubWorkflowId"`
	ToMilestoneID   string `json:"toMilestoneId"`
}

func (p *moveFeatureRequest) Bind(r *http.Request) error {
	return nil
}

func moveFeature(w http.ResponseWriter, r *http.Request) {

	data := &moveFeatureRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	id := chi.URLParam(r, "ID")

	m, err := GetEnv(r).Service.MoveFeature(id, data.ToMilestoneID, data.ToSubWorkflowID, data.Index)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, m)
}

// Common

type renameRequest struct {
	Title string `json:"title"`
}

func (p *renameRequest) Bind(r *http.Request) error {
	return nil
}

type updateDescriptionRequest struct {
	Description string `json:"description"`
}

func (p *updateDescriptionRequest) Bind(r *http.Request) error {
	return nil
}
