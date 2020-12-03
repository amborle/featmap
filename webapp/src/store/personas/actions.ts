import { IPersona } from "./types";
import { action } from 'typesafe-actions'

export enum ActionTypes {
    CREATE_PERSONA = 'CREATE_PERSONA',
    LOAD_PERSONAS = 'LOAD_PERSONAS',
    UPDATE_PERSONA = 'UPDATE_PERSONA',
    DELETE_PERSONA = 'DELETE_Persona',

}

export interface createPersona { type: ActionTypes.CREATE_PERSONA, payload: IPersona }
export const createPersona = (x: IPersona) => action(ActionTypes.CREATE_PERSONA, x)

export interface loadPersonas { type: ActionTypes.LOAD_PERSONAS, payload: IPersona[] }
export const loadPersonas = (x: IPersona[]) => action(ActionTypes.LOAD_PERSONAS, x)

export interface updatePersona { type: ActionTypes.UPDATE_PERSONA, payload: IPersona }
export const updatePersona = (x: IPersona) => action(ActionTypes.UPDATE_PERSONA, x)

export interface deletePersona { type: ActionTypes.DELETE_PERSONA, payload: string }
export const deletePersona = (x: string) => action(ActionTypes.DELETE_PERSONA, x)


export type Actions = createPersona | loadPersonas | updatePersona | deletePersona





