import { ICard } from '../../core/card'
import {CardStatus} from "../../core/misc";

export interface ISubWorkflow extends ICard {
    kind: "subworkflow"
    workflowId: string
    status: CardStatus
}