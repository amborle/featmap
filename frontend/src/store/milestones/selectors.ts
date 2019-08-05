import { AppState } from '..'
import { IMilestone } from './types'
import { createSelector } from 'reselect'

const getMilestonesState = ((state: AppState) => state.milestones)

export const milestones = createSelector([getMilestonesState], s => {
    return sortMilestones(s.items)
})


export const sortMilestones = (mm: IMilestone[]) => {
    return mm.sort(function (a, b) {
        return a.rank === b.rank ? 0 : +(a.rank > b.rank) || -1;
    }
    )
}

export const getMilestone = (ff: IMilestone[], id: string) => {
    return ff.find(f => f.id === id)!
}

export const filterMilestonesOnProject = (ff: IMilestone[], projectId: string) => {
    return ff.filter(f => f.projectId === projectId)
}



