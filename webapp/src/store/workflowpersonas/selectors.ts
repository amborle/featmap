import { AppState } from '..'
import { createSelector } from 'reselect'
import { IWorkflowPersona } from './types';

const getWorkflowPersonaState = ((state: AppState) => state.workflowPersonas)

export const workflowPersonas = createSelector([getWorkflowPersonaState], s => {
    return s.items
})


export const getWorkflowPersona = (ff: IWorkflowPersona[], id: string) => {
    return ff.find(f => f.id === id)!
}

export const filterWorkflowPersonasOnWorkflow = (ff: IWorkflowPersona[], id: string) => {
    return ff.filter(f => f.workflowId === id)!
}

export const filterWorkflowPersonasOnProject = (ff: IWorkflowPersona[], projectId: string) => {
    return ff.filter(f => f.projectId === projectId)
}
