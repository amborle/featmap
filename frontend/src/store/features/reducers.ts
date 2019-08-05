import { IFeature } from "./types";
import { Actions, ActionTypes } from "./actions";
import { sortFeatures, getFeature, filterFeaturesOnMilestoneAndSubWorkflow } from "./selectors";
import { Rank } from '../../core/lexorank'

export interface State {
    items: IFeature[]
}

export const initialState: State = {
    items: [
    ]
}

export function reducer(state: State = initialState, action: Actions) {


    switch (action.type) {
        case ActionTypes.CREATE_FEATURE: {
            const feature = action.payload
            let featureList = sortFeatures(filterFeaturesOnMilestoneAndSubWorkflow(state.items, feature.milestoneId, feature.subWorkflowId))
            feature.rank = featureList.length === 0 ? Rank("", "").rank : Rank(featureList[featureList.length - 1].rank, "").rank
            return {
                ...state,
                items: [...state.items, feature]
            }
        }
        case ActionTypes.LOAD_FEATURES: {
            const features = action.payload.map(x => ({ ...x, kind: "feature" } as IFeature)) // tag them appropriately            
            return {
                ...state,
                items: features
            }
        }
        case ActionTypes.UPDATE_FEATURE: {
            const feature = action.payload
            feature.kind = "feature"

            return {
                ...state,
                items: state.items.map(x => x.id === feature.id ? feature : x)
            }
        }
        case ActionTypes.DELETE_FEATURE: {
            const id = action.payload
            return {
                ...state,
                items: state.items.filter(x => x.id !== id)
            }
        }
        case ActionTypes.MOVE_FEATURE: {
            const { id, toMilestoneId, toSubWorkflowId, index, ts, by } = action.payload

            const f = getFeature(state.items, id)
            let ff = sortFeatures(filterFeaturesOnMilestoneAndSubWorkflow(state.items, toMilestoneId, toSubWorkflowId))

            // If the move is within the same list, we need to remove it from the list
            if (f.milestoneId === toMilestoneId && f.subWorkflowId === toSubWorkflowId) {
                ff = ff.filter(x => x.id !== f.id)
            }

            const prevRank = ff[index - 1] === undefined ? "" : ff[index - 1].rank
            const nextRank = ff[index] === undefined ? "" : ff[index].rank

            f.milestoneId = toMilestoneId
            f.subWorkflowId = toSubWorkflowId
            f.rank = Rank(prevRank, nextRank).rank
            f.lastModified = ts
            f.lastModifiedByName = by

            return {
                ...state,
                items: state.items.map(x => x.id === f.id ? f : x)
            }
        }

        default: {
            return state
        }
    }
}
