import { ICard } from '../../core/card'
import { CardStatus } from '../../core/misc'


export interface IFeature extends ICard {
    kind: "feature"
    milestoneId: string
    subWorkflowId: string
    status: CardStatus
    estimate: number
}

