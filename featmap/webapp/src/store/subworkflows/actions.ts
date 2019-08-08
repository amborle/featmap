import { ISubWorkflow } from "./types";
import { action } from 'typesafe-actions'

export enum ActionTypes {
    CREATE_SUBWORKFLOW = 'CREATE_SUBWORKFLOW',
    LOAD_SUBWORKFLOWS = 'LOAD_SUBWORKFLOWS',
    UPDATE_SUBWORKFLOW = 'UPDATE_SUBWORKFLOW',
    DELETE_SUBWORKFLOW = 'DELETE_SUBWORKFLOW',
    MOVE_SUBWORKFLOW = 'MOVE_SUBWORKFLOW',
}

export interface createSubWorkflow { type: ActionTypes.CREATE_SUBWORKFLOW, payload: ISubWorkflow }
export const createSubWorkflow = (x: ISubWorkflow) => action(ActionTypes.CREATE_SUBWORKFLOW, x)

export interface loadSubWorkflows { type: ActionTypes.LOAD_SUBWORKFLOWS, payload: ISubWorkflow[] }
export const loadSubWorkflows = (x: ISubWorkflow[]) => action(ActionTypes.LOAD_SUBWORKFLOWS, x)

export interface updateSubWorkflow { type: ActionTypes.UPDATE_SUBWORKFLOW, payload: ISubWorkflow }
export const updateSubWorkflow = (x: ISubWorkflow) => action(ActionTypes.UPDATE_SUBWORKFLOW, x)

export interface deleteSubWorkflow { type: ActionTypes.DELETE_SUBWORKFLOW, payload: string }
export const deleteSubWorkflow = (x: string) => action(ActionTypes.DELETE_SUBWORKFLOW, x)

interface moveSubWorkflowPayload { id: string, toWorkflowId: string, index: number, ts: string, by: string }
export interface moveSubWorkflow { type: ActionTypes.MOVE_SUBWORKFLOW, payload: moveSubWorkflowPayload }
export const moveSubWorkflow = (x: moveSubWorkflowPayload) => action(ActionTypes.MOVE_SUBWORKFLOW, x)

export type Actions = createSubWorkflow | loadSubWorkflows | updateSubWorkflow | deleteSubWorkflow | moveSubWorkflow