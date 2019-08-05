import { IMilestone } from "./types";
import { action } from 'typesafe-actions'

export enum ActionTypes {
    CREATE_MILESTONE = 'CREATE_MILESTONE',
    LOAD_MILESTONES = 'LOAD_MILESTONE',
    UPDATE_MILESTONE = 'UPDATE_MILESTONE',
    DELETE_MILESTONE = 'DELETE_MILESTONE',
    MOVE_MILESTONE = 'MOVE_MILESTONE',
}

export interface createMilestone { type: ActionTypes.CREATE_MILESTONE, payload: IMilestone }
export const createMilestone = (x: IMilestone) => action(ActionTypes.CREATE_MILESTONE, x)

export interface loadMilestones { type: ActionTypes.LOAD_MILESTONES, payload: IMilestone[] }
export const loadMilestones = (x: IMilestone[]) => action(ActionTypes.LOAD_MILESTONES, x)

export interface updateMilestone { type: ActionTypes.UPDATE_MILESTONE, payload: IMilestone }
export const updateMilestone = (x: IMilestone) => action(ActionTypes.UPDATE_MILESTONE, x)

export interface deleteMilestone { type: ActionTypes.DELETE_MILESTONE, payload: string }
export const deleteMilestone = (x: string) => action(ActionTypes.DELETE_MILESTONE, x)

interface moveMilestonePayload { id: string, index: number, ts: string, by: string }
export interface moveMilestone { type: ActionTypes.MOVE_MILESTONE, payload: moveMilestonePayload }
export const moveMilestone = (x: moveMilestonePayload) => action(ActionTypes.MOVE_MILESTONE, x)

export type Actions = createMilestone | loadMilestones | updateMilestone | deleteMilestone | moveMilestone





