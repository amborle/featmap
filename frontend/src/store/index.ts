import * as fromProjects from './projects/reducers'
import * as fromFeatures from './features/reducers'
import * as fromWorkflows from './workflows/reducers'
import * as fromSubWorkflows from './subworkflows/reducers'
import * as fromMilestones from './milestones/reducers'
import * as fromApplication from './application/reducers'
import { combineReducers } from 'redux';
import { RouterState, connectRouter } from 'connected-react-router'
import { History } from 'history'

import { Actions as ApplicationActions } from "./application/actions"
import { Actions as FeaturesActions } from "./features/actions"
import { Actions as MilestonesActions } from "./milestones/actions"
import { Actions as ProjectsActions } from "./projects/actions"
import { Actions as WorkflowsActions } from "./workflows/actions"
import { Actions as SubworkflowsActions } from "./workflows/actions"


export interface AppState {
    projects: fromProjects.State,
    features: fromFeatures.State,
    workflows: fromWorkflows.State,
    subWorkflows: fromSubWorkflows.State,
    milestones: fromMilestones.State
    application: fromApplication.State
    router: RouterState
}

export const reducer = (history: History) => combineReducers<AppState>({
    projects: fromProjects.reducer,
    features: fromFeatures.reducer,
    workflows: fromWorkflows.reducer,
    subWorkflows: fromSubWorkflows.reducer,
    milestones: fromMilestones.reducer,
    application: fromApplication.reducer,
    router: connectRouter(history)
})

export type AllActions = ApplicationActions | FeaturesActions | MilestonesActions | ProjectsActions | WorkflowsActions | SubworkflowsActions
