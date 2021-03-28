import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { deleteMilestoneAction, updateMilestoneAction, createMilestoneAction } from '../store/milestones/actions';
import { deleteSubWorkflowAction, updateSubWorkflowAction, createSubWorkflowAction } from '../store/subworkflows/actions';
import { deleteWorkflow, updateWorkflow, createWorkflow } from '../store/workflows/actions';
import { deleteFeatureAction, updateFeatureAction, createFeatureAction } from '../store/features/actions';
import { deleteProjectAction, updateProjectAction, createProjectAction } from '../store/projects/actions';
import { Formik, FormikHelpers as FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_RENAME_MILESTONE } from "../api";
import { API_RENAME_SUBWORKFLOW, } from "../api";
import { API_RENAME_WORKFLOW } from "../api";
import { API_RENAME_FEATURE } from "../api";
import { API_RENAME_PROJECT } from "../api";
import * as Yup from 'yup';
import { IMilestone } from '../store/milestones/types';
import { application } from '../store/application/selectors';
import { IApplication } from '../store/application/types';
import { ISubWorkflow } from '../store/subworkflows/types';
import { EntityTypes } from '../core/card'
import { IWorkflow } from '../store/workflows/types';
import { IFeature } from '../store/features/types';
import onClickOutside from "react-onclickoutside";
import { IProject } from '../store/projects/types';
import { FocusEvent } from 'react'

const mapStateToProps = (state: AppState) => ({
    application: application(state)
})

const mapDispatchToProps = {
    updateMilestone: updateMilestoneAction,
    createMilestone: createMilestoneAction,
    deleteMilestone: deleteMilestoneAction,
    updateSubWorkflow: updateSubWorkflowAction,
    createSubWorkflow: createSubWorkflowAction,
    deleteSubWorkflow: deleteSubWorkflowAction,
    updateWorkflow,
    createWorkflow,
    deleteWorkflow,
    updateFeature: updateFeatureAction,
    createFeature: createFeatureAction,
    deleteFeature: deleteFeatureAction,
    updateProject: updateProjectAction,
    createProject: createProjectAction,
    deleteProject: deleteProjectAction
}

interface PropsFromState {
    application: IApplication
}

interface PropsFromDispatch {
    updateMilestone: typeof updateMilestoneAction
    createMilestone: typeof createMilestoneAction
    deleteMilestone: typeof deleteMilestoneAction
    updateSubWorkflow: typeof updateSubWorkflowAction
    createSubWorkflow: typeof createSubWorkflowAction
    deleteSubWorkflow: typeof deleteSubWorkflowAction
    updateWorkflow: typeof updateWorkflow
    createWorkflow: typeof createWorkflow
    deleteWorkflow: typeof deleteWorkflow
    updateFeature: typeof updateFeatureAction
    createFeature: typeof createFeatureAction
    deleteFeature: typeof deleteFeatureAction
    updateProject: typeof updateProjectAction
    createProject: typeof createProjectAction
    deleteProject: typeof deleteProjectAction
}


interface SelfProps {
    card: EntityTypes
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


class EntityDetailsTitle extends Component<Props, State> {
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

    submit = (values: { title: string }, actions: FormikActions<{ title: string }>) => {

        switch (this.props.card.kind) {

            case "project": {

                const optimistic = this.props.card
                optimistic.title = values.title
                optimistic.lastModified = new Date().toISOString()
                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                this.props.updateProject(optimistic)

                if (!this.props.demo) {
                    API_RENAME_PROJECT(this.props.card.workspaceId, this.props.card.id, values.title)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: IProject) => {
                                    this.props.updateProject(data)
                                }
                                )
                            } else {
                                alert("Something went wrong when trying to rename.")
                            }
                        }
                        )
                }
                break;
            }


            case "milestone": {

                const optimistic = this.props.card
                optimistic.title = values.title
                optimistic.lastModified = new Date().toISOString()
                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                this.props.updateMilestone(optimistic)

                if (!this.props.demo) {
                    API_RENAME_MILESTONE(this.props.card.workspaceId, this.props.card.id, values.title)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: IMilestone) => {
                                    this.props.updateMilestone(data)
                                }
                                )
                            } else {
                                alert("Something went wrong when trying to rename.")
                            }
                        }
                        )
                }
                break;
            }

            case "subworkflow": {

                const optimistic = this.props.card
                optimistic.title = values.title
                optimistic.lastModified = new Date().toISOString()
                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                this.props.updateSubWorkflow(optimistic)

                if (!this.props.demo) {
                    API_RENAME_SUBWORKFLOW(this.props.card.workspaceId, this.props.card.id, values.title)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: ISubWorkflow) => {
                                    this.props.updateSubWorkflow(data)
                                }
                                )
                            } else {
                                alert("Something went wrong when trying to rename.")
                            }
                        }
                        )
                }
                break;
            }

            case "workflow": {

                const optimistic = this.props.card
                optimistic.title = values.title
                optimistic.lastModified = new Date().toISOString()
                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                this.props.updateWorkflow(optimistic)

                if (!this.props.demo) {
                    API_RENAME_WORKFLOW(this.props.card.workspaceId, this.props.card.id, values.title)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: IWorkflow) => {
                                    this.props.updateWorkflow(data)
                                }
                                )
                            } else {
                                alert("Something went wrong when trying to rename.")
                            }
                        }
                        )
                }
                break;
            }

            case "feature": {

                const optimistic = this.props.card
                optimistic.title = values.title
                optimistic.lastModified = new Date().toISOString()
                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                this.props.updateFeature(optimistic)

                if (!this.props.demo) {
                    API_RENAME_FEATURE(this.props.card.workspaceId, this.props.card.id, values.title)
                        .then(response => {
                            if (response.ok) {
                                response.json().then((data: IFeature) => {
                                    this.props.updateFeature(data)
                                }
                                )
                            } else {
                                alert("Something went wrong when trying to rename.")
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
    }

    render() {
        let closed = false
        switch (this.props.card.kind) {
            case "milestone":
            case "subworkflow":
            case "workflow":
            case "feature": {
                closed = this.props.card.status === "CLOSED"
                break;
            }
            default:
                break;
        }


        return (
            <div className=" self-start w-full  " >
                <Formik
                    initialValues={{ title: this.props.card.title }}

                    validationSchema={Yup.object().shape({
                        title: Yup.string()
                            .min(1, 'Minimum 1 characters.')
                            .max(200, 'Maximum 200 characters.')
                            .required('Title required.')
                    })}

                    onSubmit={this.submit}
                >
                    {(formikBag: FormikProps<{ title: string }>) => {

                        this.submitForm = formikBag.submitForm

                        const handleFocus = (ev: FocusEvent<HTMLInputElement>) => {
                            ev.currentTarget.select()
                        }

                        return (
                            <Form  >
                                {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}

                                {this.state.edit ?
                                    <Field
                                        name="title"
                                    >
                                        {({ form }: FieldProps<{ title: string }>) => (
                                            <div className="flex flex-col ">
                                                <div >
                                                    <input autoFocus onFocus={handleFocus} type="text" value={form.values.title} onChange={form.handleChange} placeholder="Title" id="title" className="rounded p-2  border w-full  text-xl	" />
                                                </div>
                                                <div className="p-1 text-red-500 text-xs font-bold">{form.touched.title && form.errors.title}</div>
                                            </div>
                                        )}
                                    </Field>
                                    :
                                    <div className="text-xl mt-2 ml-2 border border-white">
                                        {this.props.viewOnly || closed ? <span className={closed ? "line-through" : ""}> {this.props.card.title}</span> : <button className="text-left" onClick={() => this.setState({ edit: true })}>{this.props.card.title}</button>}
                                    </div>
                                }
                            </Form>

                        )
                    }}
                </Formik>
            </div>)

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(onClickOutside(EntityDetailsTitle))