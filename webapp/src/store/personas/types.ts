import { ICard } from '../../core/card'
import { CardStatus } from "../../core/misc";

export interface IPersona {
    workspaceId: string
    projectId: string
    id: string
    name: string
    role: string
    avatar: string
    description: string
    createdAt: string
}