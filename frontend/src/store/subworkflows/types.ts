import { ICard } from '../../core/card'

export interface ISubWorkflow extends ICard {
    kind: "subworkflow"
    workflowId: string

}