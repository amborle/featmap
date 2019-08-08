import { IProject } from './types'
import { AppState } from '..'
import { createSelector } from 'reselect'

const getProjectsState = ((state: AppState) => state.projects)

export const projects = createSelector([getProjectsState], s => {
    return sortProjectsByCreateDate(s.items)
})

export const sortProjects = (pp: IProject[]): IProject[] => {
    return pp.sort((a, b) => a.title.localeCompare(b.title))
}

export const sortProjectsByCreateDate = (pp: IProject[]): IProject[] => {
    return pp.sort((a, b) => (new Date(b.createdAt).getTime() - (new Date(a.createdAt).getTime())))
}

export const getProjectById = (pp: IProject[], id: string) => pp.find(x => x.id === id)

