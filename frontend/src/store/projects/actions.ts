import { IProject } from "./types";
import { action } from 'typesafe-actions'
import { v4 as uuid } from 'uuid'
import { Dispatch } from "react";
import { API_GET_PROJECTS, API_CREATE_PROJECT } from "../../api";
import { AllActions } from "..";

export enum ProjectsActions {
    CREATE_PROJECT = 'CREATE_PROJECT',
    LOAD_PROJECTS = 'LOAD_PROJECTS',
    UPDATE_PROJECT = 'UPDATE_PROJECT',
    DELETE_PROJECT = 'DELETE_PROJECT'
}

export interface createProject { type: ProjectsActions.CREATE_PROJECT, payload: IProject }
export const createProject = (p: IProject) => action(ProjectsActions.CREATE_PROJECT, p)

export interface loadProjects { type: ProjectsActions.LOAD_PROJECTS, payload: IProject[] }
export const loadProjects = (pp: IProject[]) => action(ProjectsActions.LOAD_PROJECTS, pp)

export interface updateProject { type: ProjectsActions.UPDATE_PROJECT, payload: IProject }
export const updateProject = (p: IProject) => action(ProjectsActions.UPDATE_PROJECT, p)

export interface deleteProject { type: ProjectsActions.DELETE_PROJECT, payload: string }
export const deleteProject = (id: string) => action(ProjectsActions.DELETE_PROJECT, id)


export type Actions = loadProjects | createProject | updateProject | deleteProject


export const loadProjectsRequest = (dispatch: Dispatch<AllActions>) => {
    return (workspaceId: string) => {

        return API_GET_PROJECTS(workspaceId)
            .then(response => {
                if (response.ok) {
                    response.json().then((data: IProject[]) => {
                        dispatch(loadProjects(data))
                    })
                }
            }
            )
    }
}


export const createProjectRequest = (dispatch: Dispatch<AllActions>) => {
    return (workspaceId: string, title: string) => {

        const projectId = uuid()

        return API_CREATE_PROJECT(workspaceId, projectId, title)
            .then(response => {
                if (response.ok) {
                    response.json().then((data: IProject) => {
                        dispatch(createProject(data))
                    })
                }
            }
            )
    }
}

