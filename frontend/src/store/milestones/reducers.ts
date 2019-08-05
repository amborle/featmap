import { IMilestone } from "./types";
import { Actions, ActionTypes } from "./actions";
import { sortMilestones, getMilestone, filterMilestonesOnProject } from "./selectors";
import { Rank } from '../../core/lexorank'

export interface State {
    items: IMilestone[]
}

export const milestonesInitialState = {
    items: [
    ]
}

export function reducer(state: State = milestonesInitialState, action: Actions) {
    switch (action.type) {
        case ActionTypes.CREATE_MILESTONE: {
            const ms = action.payload
            const ll = sortMilestones(filterMilestonesOnProject(state.items, ms.projectId))
            ms.rank = ll.length === 0 ? Rank("", "").rank : Rank(ll[ll.length - 1].rank, "").rank
            return {
                ...state,
                items: [...state.items, ms]
            }
        }

        case ActionTypes.LOAD_MILESTONES: {
            const milestones = action.payload.map(x => ({ ...x, kind: "milestone" } as IMilestone)) // tag them appropriately            
            return {
                ...state,
                items: milestones
            }
        }

        case ActionTypes.UPDATE_MILESTONE: {
            const milestone = action.payload
            milestone.kind = "milestone"

            return {
                ...state,
                items: state.items.map(x => x.id === milestone.id ? milestone : x)
            }
        }

        case ActionTypes.DELETE_MILESTONE: {
            const id = action.payload
            return {
                ...state,
                items: state.items.filter(x => x.id !== id)
            }
        }

        case ActionTypes.MOVE_MILESTONE: {
            const p = action.payload
            const m = getMilestone(state.items, p.id)
            const ff = sortMilestones(filterMilestonesOnProject(state.items, m.projectId)).filter(x => x.id !== m.id)
            const prevRank = ff[p.index - 1] === undefined ? "" : ff[p.index - 1].rank
            const nextRank = ff[p.index] === undefined ? "" : ff[p.index].rank
            m.rank = Rank(prevRank, nextRank).rank
            m.lastModified = p.ts
            m.lastModifiedByName = p.by

            return {
                ...state,
                items: state.items.map(x => x.id === m.id ? m : x)
            }

        }


        default:
            return state
    }
}

export { reducer as milestonesReducer }