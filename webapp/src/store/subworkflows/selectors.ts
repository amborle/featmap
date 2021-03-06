import { AppState } from '..'
import { createSelector } from 'reselect'
import { ISubWorkflow } from './types';
import { CardStatus } from '../../core/misc';

const getSubWorkflowsState = ((state: AppState) => state.subWorkflows)

export const subWorkflows = createSelector([getSubWorkflowsState], s => {
    return sortSubWorkflows(s.items)
})

export const sortSubWorkflows = (mm: ISubWorkflow[]) => {
    return mm.sort(function (a, b) {
        return a.rank === b.rank ? 0 : +(a.rank > b.rank) || -1;
    }
    )
}

export const getSubWorkflow = (xx: ISubWorkflow[], id: string) => {
    return xx.find(f => f.id === id)!
}

export const getSubWorkflowByWorkflow = (xx: ISubWorkflow[], id: string) => {
    return xx.filter(f => f.workflowId === id)
}

export const filterOutClosedSubWorkflows = (xx: ISubWorkflow[]) => {
    return xx.filter(f => f.status === CardStatus.OPEN)
}

export const getNbrOfClosedSubWorkflows = (xx: ISubWorkflow[]) => {
    return xx.filter(f => f.status === CardStatus.CLOSED).length
}

export const filterClosedSubWorkflows = (ff: ISubWorkflow[]) => {
    return ff.filter(f => f.status === CardStatus.CLOSED)
}





