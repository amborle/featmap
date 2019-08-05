import { Roles, SubscriptionLevels } from "../../core/misc";


export interface IApplication {
    workspaces: IWorkspace[]
    memberships: IMembership[]
    account?: IAccount
    messages: IMessage[]
    subscriptions: ISubscription[]
}

export interface IMembership {
    id: string
    workspaceId: string
    accountId: string
    level: Roles
    name: string
    email: string
    createdAt: string
}

export interface IWorkspace {
    id: string
    name: string
    createdAt: string
    allowExternalSharing: boolean
    isCompany: boolean
    euVat: string
    country: string
    externalBillingEmail: string
}

export interface IAccount {
    id: string
    name: string
    email: string
    createdAt: string
    emailConfirmed: boolean
    emailConfirmationSentTo: string
    emailConfirmationPending: boolean
}

export interface ISubscription {
    id: string
    workspaceId: string
    level: SubscriptionLevels
    numberOfEditors: number,
    fromDate: string
    expirationDate: string
    createdByName: string
    createdAt: string
    lastModified: string
    lastModifiedByName: string
    externalStatus: string
    externalPlanId: string
}

export interface IInvite {
    id: string
    workspaceId: string
    email: string
    level: string
    code: string
    createdBy: string
    createdByName: string
    createdAt: string
    createdByEmail: string
    workspaceName: string
}

export type messageTypes = "success" | "fail"

export interface IMessage { id: string, type: messageTypes, message: string }

