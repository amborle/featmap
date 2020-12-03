import { IWorkflowPersona } from "./types";
import { Actions, ActionTypes } from "./actions";

export interface State {
    items: IWorkflowPersona[]
}

export const initialState: State = {
    items: []
}

export function reducer(state: State = initialState, action: Actions) {
    switch (action.type) {
        case ActionTypes.CREATE_WORKFLOW_PERSONA: {
            const ms = action.payload
            return {
                ...state,
                items: [...state.items, ms]
            }
        }

        case ActionTypes.LOAD_WORKFLOW_PERSONAS: {
            return {
                ...state,
                items: action.payload
            }
        }

        case ActionTypes.UPDATE_WORKFLOW_PERSONA: {
            const wp = action.payload
            return {
                ...state,
                items: state.items.map(x => x.id === wp.id ? wp : x)
            }
        }

        case ActionTypes.DELETE_WORKFLOW_PERSONA: {
            const id = action.payload
            return {
                ...state,
                items: state.items.filter(x => x.id !== id)
            }
        }


        default:
            return state
    }
}

export { reducer as workflowPersonaReducer }