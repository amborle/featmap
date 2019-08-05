import { ISubWorkflow } from "./types";
import { Actions, ActionTypes } from "./actions";
import { getSubWorkflowByWorkflow, sortSubWorkflows, getSubWorkflow } from './selectors'
import { Rank } from '../../core/lexorank'

export interface State {
    items: ISubWorkflow[]
}

export const initialState: State = {
    items: []
}

export function reducer(state: State = initialState, action: Actions) {
    switch (action.type) {
        case ActionTypes.CREATE_SUBWORKFLOW: {
            const ms = action.payload
            const ll = sortSubWorkflows(getSubWorkflowByWorkflow(state.items, ms.workflowId))
            ms.rank = ll.length === 0 ? Rank("", "").rank : Rank(ll[ll.length - 1].rank, "").rank
            return {
                ...state,
                items: [...state.items, ms]
            }
        }

        case ActionTypes.LOAD_SUBWORKFLOWS: {
            const workflows = action.payload.map(x => ({ ...x, kind: "subworkflow" } as ISubWorkflow)) // tag them appropriately            

            return {
                ...state,
                items: workflows
            }
        }

        case ActionTypes.UPDATE_SUBWORKFLOW: {
            const workflow = action.payload
            workflow.kind = "subworkflow"
            return {
                ...state,
                items: state.items.map(x => x.id === workflow.id ? workflow : x)
            }
        }

        case ActionTypes.DELETE_SUBWORKFLOW: {
            const id = action.payload
            return {
                ...state,
                items: state.items.filter(x => x.id !== id)
            }
        }

        case ActionTypes.MOVE_SUBWORKFLOW: {
            const p = action.payload
            const m = getSubWorkflow(state.items, p.id)
            const ff = sortSubWorkflows(getSubWorkflowByWorkflow(state.items, p.toWorkflowId)).filter(x => x.id !== m.id)
            const prevRank = ff[p.index - 1] === undefined ? "" : ff[p.index - 1].rank
            const nextRank = ff[p.index] === undefined ? "" : ff[p.index].rank
            m.rank = Rank(prevRank, nextRank).rank
            m.workflowId = p.toWorkflowId
            m.lastModified = p.ts
            m.lastModifiedByName = p.ts

            return {
                ...state,
                items: state.items.map(x => x.id === m.id ? m : x)
            }

        }


        default:
            return state
    }
}

export { reducer as subWorkflowReducer }