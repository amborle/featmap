import { IProject } from "./types";
import { Actions, ProjectsActions, } from "./actions";

export interface State {
    items: IProject[]
}

export const initialState: State = {
    items: []
}

export function reducer(state: State = initialState, action: Actions) {

    switch (action.type) {
        case ProjectsActions.CREATE_PROJECT: {
            const project = action.payload
            project.kind = "project"

            return {
                ...state,
                items: [...state.items, project]
            }
        }

        case ProjectsActions.LOAD_PROJECTS: {
            const items = action.payload.map(x => ({ ...x, kind: "project" } as IProject)) // tag them appropriately            

            return {
                ...state,
                items: items
            }
        }

        case ProjectsActions.UPDATE_PROJECT: {
            const project = action.payload

            project.kind = "project"

            return {
                ...state,
                items: state.items.map(x => x.id === project.id ? project : x)

            }
        }

        case ProjectsActions.DELETE_PROJECT: {
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

