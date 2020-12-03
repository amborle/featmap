import { IFeatureComment } from "./types";
import { Actions, ActionTypes } from "./actions";

export interface State {
    items: IFeatureComment[]
}

export const initialState: State = {
    items: [
    ]
}

export function reducer(state: State = initialState, action: Actions) {

    switch (action.type) {
        case ActionTypes.CREATE_FEATURE_COMMENT: {
            const item = action.payload

            return {
                ...state,
                items: [...state.items, item]
            }
        }
        case ActionTypes.LOAD_FEATURE_COMMENTS: {
            const items = action.payload.map(x => ({ ...x, kind: "featureComment" } as IFeatureComment)) // tag them appropriately            
            return {
                ...state,
                items: items
            }
        }
        case ActionTypes.UPDATE_FEATURE_COMMENT: {
            const item = action.payload

            return {
                ...state,
                items: state.items.map(x => x.id === item.id ? item : x)
            }
        }
        case ActionTypes.DELETE_FEATURE_COMMENT: {
            const id = action.payload
            return {
                ...state,
                items: state.items.filter(x => x.id !== id)
            }
        }

        default: {
            return state
        }
    }
}
