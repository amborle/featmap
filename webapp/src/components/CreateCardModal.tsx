import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { application } from '../store/application/selectors'
import { createWorkflow, updateWorkflow, deleteWorkflow } from '../store/workflows/actions';
import { createSubWorkflow, updateSubWorkflow, deleteSubWorkflow } from '../store/subworkflows/actions';
import { createMilestone, updateMilestone, deleteMilestone } from '../store/milestones/actions';
import { createFeatureAction, updateFeatureAction, deleteFeatureAction } from '../store/features/actions';
import { Formik, FormikHelpers, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_CREATE_WORKFLOW, API_CREATE_MILESTONE, API_CREATE_SUBWORKFLOW, API_CREATE_FEATURE } from "../api";
import { v4 as uuid } from 'uuid'
import * as Yup from 'yup';
import { IApplication } from '../store/application/types';
import { IMilestone } from '../store/milestones/types';
import OnClickOut from 'react-onclickoutside';
import { IWorkflow } from '../store/workflows/types';
import { ISubWorkflow } from '../store/subworkflows/types';
import { IFeature } from '../store/features/types';
import { Button } from './elements';
import { CardStatus, Color } from '../core/misc';

export enum Types {
  MILESTONE = "MILESTONE",
  WORKFLOW = "WORKFLOW",
  SUBWORKFLOW = "SUBWORKFLOW",
  FEATURE = "FEATURE"
}

export interface newMilestone { type: Types.MILESTONE, payload: {} }
export interface newWorkflow { type: Types.WORKFLOW, payload: {} }
export interface newSubWorkflow { type: Types.SUBWORKFLOW, payload: { workflowId: string } }
export interface newFeature { type: Types.FEATURE, payload: { subWorkflowId: string, milestoneId: string } }

export type Actions = newMilestone | newWorkflow | newSubWorkflow | newFeature


const mapStateToProps = (state: AppState) => ({
  application: application(state)
})

const mapDispatchToProps = {
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  createSubWorkflow,
  updateSubWorkflow,
  deleteSubWorkflow,
  createFeature: createFeatureAction,
  updateFeature: updateFeatureAction,
  deleteFeature: deleteFeatureAction
}

interface PropsFromState {
  application: IApplication
}

interface PropsFromDispatch {
  createWorkflow: typeof createWorkflow
  updateWorkflow: typeof updateWorkflow
  deleteWorkflow: typeof deleteWorkflow
  createMilestone: typeof createMilestone
  updateMilestone: typeof updateMilestone
  deleteMilestone: typeof deleteMilestone
  createSubWorkflow: typeof createSubWorkflow
  updateSubWorkflow: typeof updateSubWorkflow
  deleteSubWorkflow: typeof deleteSubWorkflow
  createFeature: typeof createFeatureAction
  updateFeature: typeof updateFeatureAction
  deleteFeature: typeof deleteFeatureAction
}
interface SelfProps {
  action: Actions,
  workspaceId: string,
  projectId: string,
  close: () => void
  demo: boolean
}
type Props = PropsFromState & PropsFromDispatch & SelfProps

interface State {
}

const Schema = Yup.object().shape({
  title: Yup.string()
    .min(1, 'Minimum 1 characters.')
    .max(200, 'Maximum 200 characters.')
    .required('Required.')
});


interface formValues {
  title: string
}

class CreateCardModal extends Component<Props, State> {
  keydownHandler = (event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      this.props.close()
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keydownHandler, false);
  }


  render() {

    const parentProps = this.props


    const Dialog = class Dialog extends Component<{ close: () => void }>  {

      handleClickOutside = () => {
        this.props.close()
      }

      render() {


        return (
          <div className="bg-white p-3 w-full  max-w-xs">

            <Formik
              initialValues={{ title: '' }}

              validationSchema={Schema}

              onSubmit={(values: formValues, actions: FormikHelpers<formValues>) => {
                const t = new Date().toISOString()

                switch (parentProps.action.type) {
                  case Types.WORKFLOW: {
                    const id = uuid()
                    const optimisticWorkflow: IWorkflow = {
                      kind: "workflow",
                      id: id,
                      workspaceId: parentProps.workspaceId,
                      projectId: parentProps.projectId,
                      rank: "",
                      title: values.title,
                      description: "",
                      createdAt: t,
                      createdBy: parentProps.application.account === undefined ? "" : parentProps.application.account.id,
                      createdByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      lastModified: t,
                      lastModifiedByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      color: Color.WHITE,
                      status: CardStatus.OPEN,
                      annotations: ""
                    }
                    parentProps.createWorkflow(optimisticWorkflow)

                    if (!parentProps.demo) {
                      API_CREATE_WORKFLOW(parentProps.workspaceId, parentProps.projectId, id, values.title)
                        .then(response => {
                          if (response.ok) {
                            response.json().then((data: IWorkflow) => {
                              parentProps.updateWorkflow(data)
                            })
                          } else {
                            parentProps.deleteWorkflow(id)
                          }
                        })
                    }


                    this.props.close()
                    actions.setSubmitting(false)
                    break
                  }
                  case Types.MILESTONE: {
                    const id = uuid()

                    const optimisticMilestone: IMilestone = {
                      kind: "milestone",
                      id: id,
                      workspaceId: parentProps.workspaceId,
                      projectId: parentProps.projectId,
                      rank: "",
                      title: values.title,
                      description: "",
                      status: CardStatus.OPEN,
                      createdAt: t,
                      createdBy: parentProps.application.account === undefined ? "" : parentProps.application.account.id,
                      createdByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      lastModified: t,
                      lastModifiedByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      color: Color.NONE,
                      annotations: ""
                    }
                    parentProps.createMilestone(optimisticMilestone)

                    if (!parentProps.demo) {
                      API_CREATE_MILESTONE(parentProps.workspaceId, parentProps.projectId, id, values.title)
                        .then(response => {
                          if (response.ok) {
                            response.json().then((data: IMilestone) => {
                              parentProps.updateMilestone(data)
                            })
                          } else {
                            parentProps.deleteMilestone(id)
                          }
                        })
                    }

                    this.props.close()
                    actions.setSubmitting(false)
                    break
                  }
                  case Types.SUBWORKFLOW: {
                    const id = uuid()

                    const { workflowId } = parentProps.action.payload


                    const optimisticSubMilestone: ISubWorkflow = {
                      kind: "subworkflow",
                      id: id,
                      workspaceId: parentProps.workspaceId,
                      workflowId: workflowId,
                      rank: "",
                      title: values.title,
                      description: "",
                      createdAt: t,
                      createdBy: parentProps.application.account === undefined ? "" : parentProps.application.account.id,
                      createdByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      lastModified: t,
                      lastModifiedByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      color: Color.NONE,
                      status: CardStatus.OPEN,
                      annotations: ""
                    }
                    parentProps.createSubWorkflow(optimisticSubMilestone)

                    if (!parentProps.demo) {
                      API_CREATE_SUBWORKFLOW(parentProps.workspaceId, workflowId, id, values.title)
                        .then(response => {
                          if (response.ok) {
                            response.json().then((data: ISubWorkflow) => {
                              parentProps.updateSubWorkflow(data)
                            })
                          } else {
                            parentProps.deleteSubWorkflow(id)
                          }
                        })
                    }
                    this.props.close()
                    actions.setSubmitting(false)
                    break
                  }
                  case Types.FEATURE: {
                    const id = uuid()
                    const { subWorkflowId, milestoneId } = parentProps.action.payload
                    const optimisticFeature: IFeature = {
                      kind: "feature",
                      id: id,
                      workspaceId: parentProps.workspaceId,
                      subWorkflowId: subWorkflowId,
                      milestoneId: milestoneId,
                      rank: "",
                      title: values.title,
                      description: "",
                      status: CardStatus.OPEN,
                      createdAt: t,
                      createdBy: parentProps.application.account === undefined ? "" : parentProps.application.account.id,
                      createdByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      lastModified: t,
                      lastModifiedByName: parentProps.application.account === undefined ? "demo" : parentProps.application.account.name,
                      color: Color.NONE,
                      annotations: "",
                      estimate: 0
                    }
                    parentProps.createFeature(optimisticFeature)

                    if (!parentProps.demo) {
                      API_CREATE_FEATURE(parentProps.workspaceId, milestoneId, subWorkflowId, id, values.title)
                        .then(response => {
                          if (response.ok) {
                            response.json().then((data: IFeature) => {
                              parentProps.updateFeature(data)
                            })
                          } else {
                            parentProps.deleteFeature(id)
                          }
                        })
                    }
                    this.props.close()
                    actions.setSubmitting(false)
                    break
                  }
                  default:
                }
              }
              }
            >
              {(formikBag: FormikProps<formValues>) => (
                <Form>
                  {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}

                  <div className="flex flex-col ">
                    <div className="mb-2"> New card </div>

                    <div>

                      <Field
                        name="title"
                      >
                        {({ form }: FieldProps<formValues>) => (
                          <div className="flex flex-col">
                            <div><input autoFocus type="text" value={form.values.title} onChange={form.handleChange} placeholder="Title" id="title" className="rounded p-2 border w-full	" /></div>
                            <div className="p-1 text-red-500 text-xs font-bold">{form.touched.title && form.errors.title}</div>
                          </div>
                        )}


                      </Field>
                    </div>

                    <div className="flex justify-end">
                      <div className="flex flex-row">

                        <div className="mr-1">
                          <Button primary submit title="Create" />
                        </div>
                        <div>
                          <Button title="Cancel" handleOnClick={this.props.close} />
                        </div>
                      </div>
                    </div>
                  </div>

                </Form>
              )}
            </Formik>
          </div>
        )

      }

    }

    const DialogWithClickOutside = OnClickOut(Dialog)

    return (
      <div style={{ background: ' rgba(0,0,0,.75)' }} className="fixed p-10 z-10 top-0 left-0 w-full h-full flex items-start justify-center bg-gray-100 text-sm">
        <DialogWithClickOutside close={this.props.close} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCardModal)
