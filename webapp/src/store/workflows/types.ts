import { ICard } from '../../core/card'
import {CardStatus} from "../../core/misc";

export interface IWorkflow extends ICard {
    kind: "workflow"
    projectId: string
    status: CardStatus
}