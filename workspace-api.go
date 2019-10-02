package main

import (
	"github.com/go-chi/render"

	"net/http"

	"github.com/go-chi/chi"
)

func workspaceApi(r chi.Router) {

	r.Use(RequireAccount())
	r.Use(RequireMember())

	r.Group(func(r chi.Router) {
		r.Post("/leave", leaveWorkspace)
	})

	r.Group(func(r chi.Router) {
		r.Use(RequireOwner())
		r.Post("/delete", deleteWorkspace)
	})

	r.Group(func(r chi.Router) {
		r.Use(RequireAdmin())
		r.Get("/members", getMembers)
		r.Get("/invites", getInvites)
	})

	r.Group(func(r chi.Router) {
		r.Use(RequireAdmin())

		r.Route("/members/{ID}", func(r chi.Router) {
			r.Group(func(r chi.Router) {
				r.Post("/level", updateMemberLevel)
			})

			r.Group(func(r chi.Router) {
				r.Delete("/", deleteMember)
			})
		})
	})

	r.Group(func(r chi.Router) {
		r.Use(RequireAdmin())
		r.Post("/invites", createInvite)
	})

	r.Group(func(r chi.Router) {
		r.Use(RequireAdmin())
		r.Post("/settings/allow-external-sharing", changeExternalSharingRequest)
	})

	r.Group(func(r chi.Router) {
		r.Use(RequireAdmin())

		r.Route("/invites/{ID}", func(r chi.Router) {
			r.Group(func(r chi.Router) {
				r.Post("/resend", resendInvite)
			})

			r.Group(func(r chi.Router) {
				r.Delete("/", deleteInvite)
			})
		})
	})

	r.Group(func(r chi.Router) {

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
					r.Post("/open", openMilestone)
					r.Post("/close", closeMilestone)
					r.Post("/color", changeColorOnMilestone)
				})

				r.Route("/workflows/{ID}", func(r chi.Router) {
					r.Use(RequireEditor())
					r.Post("/", createWorkflow)
					r.Delete("/", deleteWorkflow)
					r.Post("/rename", renameWorkflow)
					r.Post("/move", moveWorkflow)
					r.Post("/description", updateWorkflowDescription)
					r.Post("/color", changeColorOnWorkflow)
					r.Post("/open", openWorkflow)
					r.Post("/close", closeWorkflow)
				})

				r.Route("/subworkflows/{ID}", func(r chi.Router) {
					r.Use(RequireEditor())
					r.Post("/", createSubWorkflow)
					r.Post("/rename", renameSubWorkflow)
					r.Delete("/", deleteSubWorkflow)
					r.Post("/move", moveSubWorkflow)
					r.Post("/description", updateSubWorkflowDescription)
					r.Post("/color", changeColorOnSubWorkflow)
					r.Post("/open", openSubWorkflow)
					r.Post("/close", closeSubWorkflow)
				})

				r.Route("/features/{ID}", func(r chi.Router) {
					r.Use(RequireEditor())
					r.Post("/", createFeature)
					r.Post("/rename", renameFeature)
					r.Delete("/", deleteFeature)
					r.Post("/move", moveFeature)
					r.Post("/description", updateFeatureDescription)
					r.Post("/open", openFeature)
					r.Post("/close", closeFeature)
					r.Post("/color", changeColorOnFeature)
				})
			})
	})
}

// Workspaces

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

func leaveWorkspace(w http.ResponseWriter, r *http.Request) {
	err := GetEnv(r).Service.Leave()
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
}

func deleteWorkspace(w http.ResponseWriter, r *http.Request) {
	err := GetEnv(r).Service.DeleteWorkspace()
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

// Settings
type booleanSettingRequest struct {
	Value bool `json:"value"`
}

func (p *booleanSettingRequest) Bind(r *http.Request) error {
	return nil
}

func changeExternalSharingRequest(w http.ResponseWriter, r *http.Request) {
	data := &booleanSettingRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	err := GetEnv(r).Service.ChangeAllowExternalSharing(data.Value)
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

type projectResponse struct {
	Project      *Project       `json:"project"`
	Milestones   []*Milestone   `json:"milestones"`
	Workflows    []*Workflow    `json:"workflows"`
	SubWorkflows []*SubWorkflow `json:"subWorkflows"`
	Features     []*Feature     `json:"features"`
}

func getProjectExtended(w http.ResponseWriter, r *http.Request) {

	s := GetEnv(r).Service
	id := chi.URLParam(r, "ID")

	project := s.GetProject(id)
	milestones := s.GetMilestonesByProject(id)
	workflows := s.GetWorkflowsByProject(id)
	subworkflows := s.GetSubWorkflowsByProject(id)
	features := s.GetFeaturesByProject(id)
	oo := projectResponse{
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

func closeMilestone(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.CloseMilestone(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func openMilestone(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.OpenMilestone(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func changeColorOnMilestone(w http.ResponseWriter, r *http.Request) {
	data := &changeColorRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.ChangeColorOnMilestone(id, data.Color)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
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

func changeColorOnWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &changeColorRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.ChangeColorOnWorkflow(id, data.Color)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func closeWorkflow(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.CloseWorkflow(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func openWorkflow(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.OpenWorkflow(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
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

func changeColorOnSubWorkflow(w http.ResponseWriter, r *http.Request) {
	data := &changeColorRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.ChangeColorOnSubWorkflow(id, data.Color)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func closeSubWorkflow(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.CloseSubWorkflow(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func openSubWorkflow(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.OpenSubWorkflow(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
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

func closeFeature(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.CloseFeature(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}

func openFeature(w http.ResponseWriter, r *http.Request) {

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.OpenFeature(id)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
}
func changeColorOnFeature(w http.ResponseWriter, r *http.Request) {
	data := &changeColorRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	id := chi.URLParam(r, "ID")

	f, err := GetEnv(r).Service.ChangeColorOnFeature(id, data.Color)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, f)
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

type changeColorRequest struct {
	Color string `json:"color"`
}

func (p *changeColorRequest) Bind(r *http.Request) error {
	return nil
}
