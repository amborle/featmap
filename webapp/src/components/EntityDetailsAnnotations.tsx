import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { deleteMilestone, updateMilestone, createMilestone } from '../store/milestones/actions';
import { deleteSubWorkflow, updateSubWorkflow, createSubWorkflow } from '../store/subworkflows/actions';
import { deleteWorkflow, updateWorkflow, createWorkflow } from '../store/workflows/actions';
import { deleteFeature, updateFeature, createFeature } from '../store/features/actions';
import { deleteProject, updateProject, createProject } from '../store/projects/actions';
import { IMilestone } from '../store/milestones/types';
import { application } from '../store/application/selectors';
import { IApplication } from '../store/application/types';
import { ISubWorkflow } from '../store/subworkflows/types';
import { EntityTypes } from '../core/card'
import { IWorkflow } from '../store/workflows/types';
import { IFeature } from '../store/features/types';
import onClickOutside from "react-onclickoutside";
import { allAnnotations, dbAnnotationsFromNames } from '../core/misc';
import { Button } from './elements';
import ContextMenu from './ContextMenu';
import { API_CHANGE_FEATURE_ANNOTATIONS, API_CHANGE_WORKFLOW_ANNOTATIONS, API_CHANGE_SUBWORKFLOW_ANNOTATIONS, API_CHANGE_MILESTONE_ANNOTATIONS } from '../api';

const mapStateToProps = (state: AppState) => ({
    application: application(state)
})

const mapDispatchToProps = {
    updateMilestone,
    createMilestone,
    deleteMilestone,
    updateSubWorkflow,
    createSubWorkflow,
    deleteSubWorkflow,
    updateWorkflow,
    createWorkflow,
    deleteWorkflow,
    updateFeature,
    createFeature,
    deleteFeature,
    updateProject,
    createProject,
    deleteProject
}

interface PropsFromState {
    application: IApplication
}

interface PropsFromDispatch {
    updateMilestone: typeof updateMilestone
    createMilestone: typeof createMilestone
    deleteMilestone: typeof deleteMilestone
    updateSubWorkflow: typeof updateSubWorkflow
    createSubWorkflow: typeof createSubWorkflow
    deleteSubWorkflow: typeof deleteSubWorkflow
    updateWorkflow: typeof updateWorkflow
    createWorkflow: typeof createWorkflow
    deleteWorkflow: typeof deleteWorkflow
    updateFeature: typeof updateFeature
    createFeature: typeof createFeature
    deleteFeature: typeof deleteFeature
    updateProject: typeof updateProject
    createProject: typeof createProject
    deleteProject: typeof deleteProject
}


interface SelfProps {
    card: EntityTypes
    close: () => void
    edit: boolean
    demo: boolean
    open: boolean
    viewOnly: boolean
}
type Props = PropsFromState & PropsFromDispatch & SelfProps


interface State {
    edit: boolean
}

class EntityDetailsAnnotations extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = { edit: this.props.edit }
    }

    handleAddAnnotation = (name: string) => {
        const currentAnnotations = dbAnnotationsFromNames(this.props.card.annotations)
        currentAnnotations.add(name)
        this.updateAnnotations(currentAnnotations.toString())
    }

    handleRemoveAnnotation = (name: string) => {
        const currentAnnotations = dbAnnotationsFromNames(this.props.card.annotations)
        currentAnnotations.remove([name])
        this.updateAnnotations(currentAnnotations.toString())
    }

    updateAnnotations = (names: string) => {
        const card = this.props.card
        switch (card.kind) {
            case "feature": {
                this.props.updateFeature({ ...card, annotations: names, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
                if (!this.props.demo) {
                    API_CHANGE_FEATURE_ANNOTATIONS(card.workspaceId, card.id, names)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: IFeature) => {
                                    this.props.updateFeature(data)
                                }
                                )
                            } else {
                                alert("Something went wrong.")
                            }
                        })
                }
                break;
            }

            case "workflow": {
                this.props.updateWorkflow({ ...card, annotations: names, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
                if (!this.props.demo) {
                    API_CHANGE_WORKFLOW_ANNOTATIONS(card.workspaceId, card.id, names)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: IWorkflow) => {
                                    this.props.updateWorkflow(data)
                                }
                                )
                            } else {
                                alert("Something went wrong.")
                            }
                        })
                }
                break;
            }

            case "subworkflow": {
                this.props.updateSubWorkflow({ ...card, annotations: names, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
                if (!this.props.demo) {
                    API_CHANGE_SUBWORKFLOW_ANNOTATIONS(card.workspaceId, card.id, names)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: ISubWorkflow) => {
                                    this.props.updateSubWorkflow(data)
                                }
                                )
                            } else {
                                alert("Something went wrong.")
                            }
                        })
                }
                break;
            }


            case "milestone": {
                this.props.updateMilestone({ ...card, annotations: names, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
                if (!this.props.demo) {
                    API_CHANGE_MILESTONE_ANNOTATIONS(card.workspaceId, card.id, names)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: IMilestone) => {
                                    this.props.updateMilestone(data)
                                }
                                )
                            } else {
                                alert("Something went wrong.")
                            }
                        })
                }
                break;
            }

        }

    }

    handleClickOutside = () => {
        if (this.state.edit) {
            this.setState({ edit: false })
        }
    }


    render() {
        const currentAnnotations = dbAnnotationsFromNames(this.props.card.annotations)
        const leftOverAnnotations = allAnnotations().remove(currentAnnotations.annotations.map(c => c.name))
        return (
            <div className="flex flex-wrap">

                {currentAnnotations.annotations.map((x, i) => {

                    const tag = (name: string, text: string, icon: string = "error") => (
                        <div key={i} className=" mb-1 py-1 pl-2 pr-2 bg-gray-200  text-xs  font-medium   flex items-center  mr-2 rounded-full whitespace-nowrap " >

                            <i style={{ fontSize: "18px" }} className="material-icons  text-gray-700  align-middle mr-1">{icon} </i>
                            <span className="mr-2">{text}</span>

                            {this.props.open && !this.props.viewOnly &&
                                <button onClick={() => this.handleRemoveAnnotation(name)}><i style={{ fontSize: "14px" }} className="material-icons text-gray-700 align-middle">clear</i></button>}


                        </div>
                    )

                    return tag(x.name, x.description, x.icon)
                })
                }

                {leftOverAnnotations.annotations.length && this.props.open && !this.props.viewOnly && !(this.props.card.kind === "project") ?

                    <ContextMenu icon="add" text="Annotation" smallIcon>
                        <div className="rounded bg-white shadow-md  absolute mt-8 top-0 left-0 min-w-full text-xs" >
                            <ul className="list-reset">
                                {
                                    (leftOverAnnotations).annotations.map((an, i) => {
                                        return <li key={i}><Button noborder title={an.description} icon={an.icon} handleOnClick={() => this.handleAddAnnotation(an.name)} /></li>
                                    })
                                }

                            </ul>
                        </div>
                    </ContextMenu>
                    : null
                }
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(onClickOutside(EntityDetailsAnnotations))