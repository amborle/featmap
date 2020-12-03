import { ICard } from '../../core/card'
import { CardStatus } from '../../core/misc'


export interface IFeatureComment {
    kind: "featureComment"
    id: string
    workspaceId: string
    featureId: string
    projectId: string
    createdAt: string
    createdByName: string
    lastModified: string
    post: string
    memberId: string
}

