import { AppState } from '..'
import { createSelector } from 'reselect'
import { IFeatureComment } from './types';

const getFeatureCommentsState = ((state: AppState) => state.featureComments)

export const featureComments = createSelector([getFeatureCommentsState], s => {
    return sortFeatureComments(s.items)
})

export const sortFeatureComments = (ff: IFeatureComment[]): IFeatureComment[] => {
    return ff.sort((a, b) => (new Date(b.createdAt).getTime() - (new Date(a.createdAt).getTime())))
}

export const filterFeatureCommentsOnFeature = (ff: IFeatureComment[], featureId: string) => {
    return ff.filter(f => f.featureId === featureId)
}

export const getFeatureComment = (ff: IFeatureComment[], id: string) => {
    return ff.find(f => f.id === id)!
}

export const filterFeatureCommentsOnProject = (ff: IFeatureComment[], projectId: string) => {
    return ff.filter(f => f.projectId === projectId)
}

