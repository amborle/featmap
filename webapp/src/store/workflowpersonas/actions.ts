import { IWorkflowPersona } from "./types";
import { action } from 'typesafe-actions'

export enum ActionTypes {
    CREATE_WORKFLOW_PERSONA = 'CREATE_WORKFLOW_PERSONA',
    LOAD_WORKFLOW_PERSONAS = 'LOAD_WORKFLOW_PERSONAS',
    UPDATE_WORKFLOW_PERSONA = 'UPDATE_WORKFLOW_PERSONA',
    DELETE_WORKFLOW_PERSONA = 'DELETE_WORKFLOW_PERSONA',

}

export interface createWorkflowPersona { type: ActionTypes.CREATE_WORKFLOW_PERSONA, payload: IWorkflowPersona }
export const createWorkflowPersonaAction = (x: IWorkflowPersona) => action(ActionTypes.CREATE_WORKFLOW_PERSONA, x)

export interface loadWorkflowPersonas { type: ActionTypes.LOAD_WORKFLOW_PERSONAS, payload: IWorkflowPersona[] }
export const loadWorkflowPersonasAction = (x: IWorkflowPersona[]) => action(ActionTypes.LOAD_WORKFLOW_PERSONAS, x)

export interface updateWorkflowPersona { type: ActionTypes.UPDATE_WORKFLOW_PERSONA, payload: IWorkflowPersona }
export const updateWorkflowPersonaAction = (x: IWorkflowPersona) => action(ActionTypes.UPDATE_WORKFLOW_PERSONA, x)

export interface deleteWorkflowPersona { type: ActionTypes.DELETE_WORKFLOW_PERSONA, payload: string }
export const deleteWorkflowPersonaAction = (x: string) => action(ActionTypes.DELETE_WORKFLOW_PERSONA, x)


export type Actions = createWorkflowPersona | loadWorkflowPersonas | updateWorkflowPersona | deleteWorkflowPersona





