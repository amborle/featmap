import { AppState } from '..'
import { createSelector } from 'reselect'
import { IWorkflow } from './types';

const getWorkflowsState = ((state: AppState) => state.workflows)

export const workflows = createSelector([getWorkflowsState], s => {
    return sortWorkflows(s.items)
})


export const sortWorkflows = (mm: IWorkflow[]) => {
    return mm.sort(function (a, b) {
        return a.rank === b.rank ? 0 : +(a.rank > b.rank) || -1;
    }
    )
}

export const getWorkflow = (ff: IWorkflow[], id: string) => {
    return ff.find(f => f.id === id)!
}

export const filterWorkflowsOnProject = (ff: IWorkflow[], projectId: string) => {
    return ff.filter(f => f.projectId === projectId)
}

export const filterOutClosedWorkflows = (xx: IWorkflow[]) => {
    return xx.filter(f => f.status === "OPEN")
}
