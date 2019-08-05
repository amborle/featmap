import { IWorkflow } from "./types";
import { Actions, ActionTypes } from "./actions";
import { sortWorkflows, filterWorkflowsOnProject, getWorkflow } from "./selectors";
import { Rank } from '../../core/lexorank'

export interface State {
    items: IWorkflow[]
}

export const initialState: State = {
    items: []
}

export function reducer(state: State = initialState, action: Actions) {
    switch (action.type) {
        case ActionTypes.CREATE_WORKFLOW: {
            const ms = action.payload
            const ll = sortWorkflows(filterWorkflowsOnProject(state.items, ms.projectId))
            ms.rank = ll.length === 0 ? Rank("", "").rank : Rank(ll[ll.length - 1].rank, "").rank
            return {
                ...state,
                items: [...state.items, ms]
            }
        }

        case ActionTypes.LOAD_WORKFLOWS: {
            const workflows = action.payload.map(x => ({ ...x, kind: "workflow" } as IWorkflow)) // tag them appropriately                        
            return {
                ...state,
                items: workflows
            }
        }

        case ActionTypes.UPDATE_WORKFLOW: {
            const workflow = action.payload
            workflow.kind = "workflow"
            return {
                ...state,
                items: state.items.map(x => x.id === workflow.id ? workflow : x)
            }
        }

        case ActionTypes.DELETE_WORKFLOW: {
            const id = action.payload
            return {
                ...state,
                items: state.items.filter(x => x.id !== id)
            }
        }

        case ActionTypes.MOVE_WORKFLOW: {
            const p = action.payload
            const m = getWorkflow(state.items, p.id)
            const ff = sortWorkflows(filterWorkflowsOnProject(state.items, m.projectId)).filter(x => x.id !== m.id)
            const prevRank = ff[p.index - 1] === undefined ? "" : ff[p.index - 1].rank
            const nextRank = ff[p.index] === undefined ? "" : ff[p.index].rank
            m.rank = Rank(prevRank, nextRank).rank
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

export { reducer as workflowsReducer }