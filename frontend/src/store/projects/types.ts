
export interface IProject {
    kind: "project"
    workspaceId: string
    id: string
    title: string
    description: string
    createdAt: string
    createdBy: string
    createdByName: string
    lastModified: string
    lastModifiedByName: string
    externalLink: string
}
