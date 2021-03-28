import { IFeatureComment } from "./types";
import { action } from 'typesafe-actions'

export enum ActionTypes {
    CREATE_FEATURE_COMMENT = 'CREATE_FEATURE_COMMENT',
    LOAD_FEATURE_COMMENTS = 'LOAD_FEATURE_COMMENTS',
    UPDATE_FEATURE_COMMENT = 'UPDATE_FEATURE_COMMENT',
    DELETE_FEATURE_COMMENT = 'DELETE_FEATURE_COMMENT',
}

export interface createFeatureComment { type: ActionTypes.CREATE_FEATURE_COMMENT, payload: IFeatureComment }
export const createFeatureCommentAction = (x: IFeatureComment) => action(ActionTypes.CREATE_FEATURE_COMMENT, x)

export interface loadFeatureComments { type: ActionTypes.LOAD_FEATURE_COMMENTS, payload: IFeatureComment[] }
export const loadFeatureCommentsAction = (x: IFeatureComment[]) => action(ActionTypes.LOAD_FEATURE_COMMENTS, x)

export interface updateFeatureComment { type: ActionTypes.UPDATE_FEATURE_COMMENT, payload: IFeatureComment }
export const updateFeatureCommentAction = (x: IFeatureComment) => action(ActionTypes.UPDATE_FEATURE_COMMENT, x)

export interface deleteFeatureComment { type: ActionTypes.DELETE_FEATURE_COMMENT, payload: string }
export const deleteFeatureCommentAction = (x: string) => action(ActionTypes.DELETE_FEATURE_COMMENT, x)

export type Actions = createFeatureComment | loadFeatureComments | updateFeatureComment | deleteFeatureComment