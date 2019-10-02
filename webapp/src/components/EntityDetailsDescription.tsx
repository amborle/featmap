import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { updateMilestone } from '../store/milestones/actions';
import { updateSubWorkflow } from '../store/subworkflows/actions';
import { updateWorkflow } from '../store/workflows/actions';
import { updateFeature } from '../store/features/actions';
import { updateProject } from '../store/projects/actions';
import { Formik, FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_UPDATE_MILESTONE_DESCRIPTION, API_UPDATE_PROJECT_DESCRIPTION } from "../api";
import { API_UPDATE_SUBWORKFLOW_DESCRIPTION } from "../api";
import { API_UPDATE_WORKFLOW_DESCRIPTION } from "../api";
import { API_UPDATE_FEATURE_DESCRIPTION } from "../api";
import * as Yup from 'yup';
import { IMilestone } from '../store/milestones/types';
import { application } from '../store/application/selectors';
import { IApplication } from '../store/application/types';
import { ISubWorkflow } from '../store/subworkflows/types';
import { EntityTypes } from '../core/card'
import { IWorkflow } from '../store/workflows/types';
import { IFeature } from '../store/features/types';
import onClickOutside from "react-onclickoutside";
import ReactMarkdown from 'react-markdown'
import { Button } from './elements';
import { IProject } from '../store/projects/types';

const mapStateToProps = (state: AppState) => ({
    application: application(state)
})

const mapDispatchToProps = {
    updateMilestone,
    updateSubWorkflow,
    updateWorkflow,
    updateFeature,
    updateProject,
}

interface PropsFromState {
    application: IApplication
}

interface PropsFromDispatch {
    updateMilestone: typeof updateMilestone
    updateSubWorkflow: typeof updateSubWorkflow
    updateWorkflow: typeof updateWorkflow
    updateFeature: typeof updateFeature
    updateProject: typeof updateProject
}


interface SelfProps {
    entity: EntityTypes
    app: IApplication
    url: string
    close: () => void
    viewOnly: boolean
    demo: boolean
}
type Props = PropsFromState & PropsFromDispatch & SelfProps


interface State {
    edit: boolean
}


class EntityDetailsDescription extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.submitForm = () => { }

        this.state = { edit: false }
    }


    handleClickOutside = () => {
        if (this.state.edit) {
            this.setState({ edit: false })
            this.submitForm()
        }
    }

    submitForm: () => void;


    render() {
        let closed = false
        switch (this.props.entity.kind) {
            case "milestone":
            case "subworkflow":
            case "workflow":
            case "feature": {
                closed = this.props.entity.status === "CLOSED"
                break;
            }
            default:
                break;
        }

        return (
            <div className=" self-start w-full mb-4 " >

                <Formik
                    initialValues={{ description: this.props.entity.description }}

                    validationSchema={Yup.object().shape({
                        description: Yup.string()
                            .max(10000, 'Maximum 10000 characters.')
                    })}

                    onSubmit={(values: { description: string }, actions: FormikActions<{ description: string }>) => {

                        switch (this.props.entity.kind) {
                            case "project": {
                                const optimistic = this.props.entity
                                optimistic.description = values.description
                                optimistic.lastModified = new Date().toISOString()
                                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                                this.props.updateProject(optimistic)

                                if (!this.props.demo) {
                                    API_UPDATE_PROJECT_DESCRIPTION(this.props.entity.workspaceId, this.props.entity.id, values.description)
                                        .then(response => {
                                            if (response.ok) {
                                                response.json().then((data: IProject) => {
                                                    this.props.updateProject(data)
                                                }
                                                )
                                            } else {
                                                alert("Something went wrong when updating description.")
                                            }
                                        }
                                        )
                                }

                                break;
                            }

                            case "milestone": {
                                const optimistic = this.props.entity
                                optimistic.description = values.description
                                optimistic.lastModified = new Date().toISOString()
                                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                                this.props.updateMilestone(optimistic)
                                if (!this.props.demo) {
                                    API_UPDATE_MILESTONE_DESCRIPTION(this.props.entity.workspaceId, this.props.entity.id, values.description)
                                        .then(response => {
                                            if (response.ok) {
                                                response.json().then((data: IMilestone) => {
                                                    this.props.updateMilestone(data)
                                                }
                                                )
                                            } else {
                                                alert("Something went wrong when updating description.")
                                            }
                                        }
                                        )
                                }

                                break;
                            }

                            case "subworkflow": {
                                const optimistic = this.props.entity
                                optimistic.description = values.description
                                optimistic.lastModified = new Date().toISOString()
                                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                                this.props.updateSubWorkflow(optimistic)

                                if (!this.props.demo) {
                                    API_UPDATE_SUBWORKFLOW_DESCRIPTION(this.props.entity.workspaceId, this.props.entity.id, values.description)
                                        .then(response => {
                                            if (response.ok) {
                                                response.json().then((data: ISubWorkflow) => {
                                                    this.props.updateSubWorkflow(data)
                                                }
                                                )
                                            } else {
                                                alert("Something went wrong when updating description.")
                                            }
                                        }
                                        )
                                }

                                break;
                            }

                            case "workflow": {
                                const optimistic = this.props.entity
                                optimistic.description = values.description
                                optimistic.lastModified = new Date().toISOString()
                                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                                this.props.updateWorkflow(optimistic)

                                if (!this.props.demo) {
                                    API_UPDATE_WORKFLOW_DESCRIPTION(this.props.entity.workspaceId, this.props.entity.id, values.description)
                                        .then(response => {
                                            if (response.ok) {
                                                response.json().then((data: IWorkflow) => {
                                                    this.props.updateWorkflow(data)
                                                }
                                                )
                                            } else {
                                                alert("Something went wrong when updating description.")
                                            }
                                        }
                                        )
                                }

                                break;
                            }

                            case "feature": {
                                const optimistic = this.props.entity
                                optimistic.description = values.description
                                optimistic.lastModified = new Date().toISOString()
                                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                                this.props.updateFeature(optimistic)

                                if (!this.props.demo) {
                                    API_UPDATE_FEATURE_DESCRIPTION(this.props.entity.workspaceId, this.props.entity.id, values.description)
                                        .then(response => {
                                            if (response.ok) {
                                                response.json().then((data: IFeature) => {
                                                    this.props.updateFeature(data)
                                                }
                                                )
                                            } else {
                                                alert("Something went wrong when updating description.")
                                            }
                                        }
                                        )

                                }
                                break;
                            }

                            default:
                                break;
                        }

                        this.setState({ edit: false })
                        actions.setSubmitting(false)
                    }}
                    render={(formikBag: FormikProps<{ description: string }>) => {

                        this.submitForm = formikBag.submitForm

                        return (
                            <Form  >
                                {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}

                                {this.state.edit ?
                                    <Field
                                        name="description"
                                        render={({ field, form }: FieldProps<{ description: string }>) => (
                                            <div className="flex flex-col mt-1 ">
                                                <div className="markdown" >
                                                    <textarea autoFocus rows={20} {...field} placeholder="Description" id="description" className="rounded p-2  border w-full  	"/>
                                                </div>
                                                <span className="text-xs right p-1">The description supports formatting through <a rel="noopener noreferrer" target="_blank" className="link" href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet">Markdown</a>.</span>
                                                <div className="p-1 text-red-500 text-xs font-bold">{form.touched.description && form.errors.description}</div>
                                            </div>
                                        )}
                                    />
                                    :
                                    <div className=" mt-2 ml-2 border border-white  ">
                                        <div>
                                            {this.props.entity.description.length === 0 ? (
                                                <div>
                                                    <em>No description.</em>
                                                </div>)
                                                :
                                                <div>
                                                    <div className="text-left markdown overflow-auto">
                                                        <ReactMarkdown source={this.props.entity.description} linkTarget="_blank" />
                                                    </div>
                                                </div>
                                            }
                                            <div className="mt-1">
                                                {!(this.props.viewOnly || closed) && <Button title="Edit description" icon="edit" handleOnClick={() => this.setState({ edit: true })} />}
                                            </div>
                                        </div>

                                    </div>
                                }
                            </Form>
                        )
                    }}
                />
            </div>)

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(onClickOutside(EntityDetailsDescription))