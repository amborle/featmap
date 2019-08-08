import { ICard } from '../../core/card'

export interface IWorkflow extends ICard {
    kind: "workflow"
    projectId: string

}