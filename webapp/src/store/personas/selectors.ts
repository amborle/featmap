import { AppState } from '..'
import { createSelector } from 'reselect'
import { IPersona } from './types';

const getPersonaState = ((state: AppState) => state.personas)

export const personas = createSelector([getPersonaState], s => {
    return sortPersonas(s.items)
})


export const sortPersonas = (mm: IPersona[]) => {
    return mm.sort((a, b) => a.name.localeCompare(b.name))

}

export const getPersona = (ff: IPersona[], id: string) => {
    return ff.find(f => f.id === id)!
}

export const filterPersonasOnProject = (ff: IPersona[], is: string) => {
    return ff.filter(f => f.projectId === is)
}

export const removeSpecificPersonas = (ff: IPersona[], ids: string[]) => {
    return ff.filter(f => !ids.includes(f.id))
}
