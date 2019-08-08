import { IWorkflow } from "./types";
import { action } from 'typesafe-actions'

export enum ActionTypes {
    CREATE_WORKFLOW = 'CREATE_WORKFLOW',
    LOAD_WORKFLOWS = 'LOAD_WORKFLOWS',
    UPDATE_WORKFLOW = 'UPDATE_WORKFLOW',
    DELETE_WORKFLOW = 'DELETE_WORKFLOW',
    MOVE_WORKFLOW = 'MOVE_WORKFLOW',
}

export interface createWorkflow { type: ActionTypes.CREATE_WORKFLOW, payload: IWorkflow }
export const createWorkflow = (x: IWorkflow) => action(ActionTypes.CREATE_WORKFLOW, x)

export interface loadWorkflows { type: ActionTypes.LOAD_WORKFLOWS, payload: IWorkflow[] }
export const loadWorkflows = (x: IWorkflow[]) => action(ActionTypes.LOAD_WORKFLOWS, x)

export interface updateWorkflow { type: ActionTypes.UPDATE_WORKFLOW, payload: IWorkflow }
export const updateWorkflow = (x: IWorkflow) => action(ActionTypes.UPDATE_WORKFLOW, x)

export interface deleteWorkflow { type: ActionTypes.DELETE_WORKFLOW, payload: string }
export const deleteWorkflow = (x: string) => action(ActionTypes.DELETE_WORKFLOW, x)

interface moveWorkflowPayload { id: string, index: number, ts: string, by: string }
export interface moveWorkflow { type: ActionTypes.MOVE_WORKFLOW, payload: moveWorkflowPayload }
export const moveWorkflow = (x: moveWorkflowPayload) => action(ActionTypes.MOVE_WORKFLOW, x)

export type Actions = createWorkflow | loadWorkflows | updateWorkflow | deleteWorkflow | moveWorkflow





