import { AppState } from '..'
import { createSelector } from 'reselect'
import { IApplication } from './types';

const getApplicationState = ((state: AppState) => state.application)

export const application = createSelector([getApplicationState], s => {
    return s.application
})

export const getWorkspaceByName = (s: IApplication, name: string) => s.workspaces.find(x => x.name === name)
export const getMembership = (s: IApplication, workspaceId: string) => s.memberships.find(x => x.workspaceId === workspaceId)!
export const getSubscription = (s: IApplication, workspaceId: string) => s.subscriptions.find(x => x.workspaceId === workspaceId)!
export const getAccount = (s: IApplication) => s.account!
