import { ICard } from '../../core/card'
import { CardStatus } from '../../core/misc';

export interface IMilestone extends ICard {
    kind: "milestone"
    projectId: string
    status: CardStatus
}

