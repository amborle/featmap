import { IPersona } from "./types";
import { Actions, ActionTypes } from "./actions";

export interface State {
    items: IPersona[]
}

export const initialState: State = {
    items: []
}

export function reducer(state: State = initialState, action: Actions) {
    switch (action.type) {
        case ActionTypes.CREATE_PERSONA: {
            const ms = action.payload
            return {
                ...state,
                items: [...state.items, ms]
            }
        }

        case ActionTypes.LOAD_PERSONAS: {
            return {
                ...state,
                items: action.payload
            }
        }

        case ActionTypes.UPDATE_PERSONA: {
            const persona = action.payload
            return {
                ...state,
                items: state.items.map(x => x.id === persona.id ? persona : x)
            }
        }

        case ActionTypes.DELETE_PERSONA: {
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

export { reducer as personaReducer }