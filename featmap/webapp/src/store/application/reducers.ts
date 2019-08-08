import { IApplication } from "./types";
import { AppActions, Actions } from "./actions";

export interface State {
    application: IApplication
}

export const applicationInitialState: State = {
    application: {
        workspaces: [],
        memberships: [],
        messages: [],
        subscriptions: [],
    }
}

export function reducer(state: State = applicationInitialState, action: Actions) {
    switch (action.type) {
        case AppActions.LOAD_APPLICATION: {
            const app = action.payload
            app.messages = []
            return {
                ...state,
                application: app
            }
        }

        case AppActions.RESET_APPLICATION: {
            return {
                ...state,
                application: applicationInitialState.application
            }

        }

        case AppActions.CREATE_MESSAGE: {
            const message = action.payload
            return {
                ...state,
                application: { ...state.application, messages: [...state.application.messages, message] }
            }

        }

        case AppActions.DELETE_MESSAGE: {
            const id = action.payload
            return {
                ...state,
                application: { ...state.application, messages: state.application.messages.filter(x => x.id !== id) }
            }

        }

        default:
            return state
    }
}

export { reducer as applicationReducer }