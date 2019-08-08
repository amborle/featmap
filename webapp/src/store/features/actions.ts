import { IFeature } from "./types";
import { action } from 'typesafe-actions'

export enum ActionTypes {
    CREATE_FEATURE = 'CREATE_FEATURE',
    LOAD_FEATURES = 'LOAD_FEATURES',
    UPDATE_FEATURE = 'UPDATE_FEATURE',
    DELETE_FEATURE = 'DELETE_FEATURE',
    MOVE_FEATURE = 'MOVE_FEATURE'
}

export interface createFeature { type: ActionTypes.CREATE_FEATURE, payload: IFeature }
export const createFeature = (x: IFeature) => action(ActionTypes.CREATE_FEATURE, x)

export interface loadFeatures { type: ActionTypes.LOAD_FEATURES, payload: IFeature[] }
export const loadFeatures = (x: IFeature[]) => action(ActionTypes.LOAD_FEATURES, x)

export interface updateFeature { type: ActionTypes.UPDATE_FEATURE, payload: IFeature }
export const updateFeature = (x: IFeature) => action(ActionTypes.UPDATE_FEATURE, x)

export interface deleteFeature { type: ActionTypes.DELETE_FEATURE, payload: string }
export const deleteFeature = (x: string) => action(ActionTypes.DELETE_FEATURE, x)

interface moveFeaturePayload { id: string, toMilestoneId: string, toSubWorkflowId: string, index: number, ts: string, by: string }
export interface moveFeature { type: ActionTypes.MOVE_FEATURE, payload: moveFeaturePayload }
export const moveFeature = (x: moveFeaturePayload) => action(ActionTypes.MOVE_FEATURE, x)

export type Actions = createFeature | loadFeatures | updateFeature | deleteFeature | moveFeature