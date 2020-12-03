import { ICard } from '../../core/card'
import { CardStatus } from "../../core/misc";

export interface IWorkflowPersona {
    id: string
    personaId: string
    projectId: string
    workflowId: string
    workspaceId: string
}