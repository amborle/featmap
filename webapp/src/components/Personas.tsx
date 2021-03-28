import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { application } from '../store/application/selectors'
import { Formik, FormikHelpers, FormikProps, Form, Field, ErrorMessage } from 'formik';
import { API_UPDATE_PERSONA, API_DELTE_PERSONA, API_CREATE_PERSONA } from "../api";
import * as Yup from 'yup';
import { IApplication } from '../store/application/types';
import OnClickOut from 'react-onclickoutside';
import { DarkButton, Button } from './elements';
import { personaBarState } from '../core/misc';
import { IPersona } from '../store/personas/types';
import { avatar } from '../avatars';
import ReactMarkdown from 'react-markdown';
import { getPersona } from '../store/personas/selectors';
import { updatePersona, deletePersona, createPersona } from '../store/personas/actions';
import { createWorkflowPersona } from '../store/workflowpersonas/actions';
import ContextMenu from './ContextMenu';
import { v4 as uuid } from 'uuid'
import { IWorkflowPersona } from '../store/workflowpersonas/types';

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
  updatePersona,
  deletePersona,
  createPersona,
  createWorkflowPersona
}

interface PropsFromState {
  application: IApplication
}

interface PropsFromDispatch {
  updatePersona: typeof updatePersona
  deletePersona: typeof deletePersona
  createPersona: typeof createPersona
  createWorkflowPersona: typeof createWorkflowPersona
}
interface SelfProps {
  personas: IPersona[]
  workspaceId: string,
  projectId: string,
  close: () => void
  demo: boolean,
  pageState: personaBarState
  setPageState: (s: personaBarState) => void
  viewOnly: boolean
}
type Props = PropsFromState & PropsFromDispatch & SelfProps

interface State {
}


class Personas extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  keydownHandler = (event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      this.props.close()
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keydownHandler, false);
  }


  handleDeletePersona(personaId: string) {


    this.props.setPageState({ page: "all" })
    this.props.deletePersona(personaId)

    if (!this.props.demo) {
      API_DELTE_PERSONA(this.props.workspaceId, personaId)
        .then(response => {
          if (response.ok) {

          } else {
            alert("something went wrong when deleting persona")
          }
        })
    }


  }

  render() {

    const parentProps = this.props

    const parent = this

    const Dialog = class Dialog extends Component<{ close: () => void }>  {

      handleClickOutside = () => {
        this.props.close()
      }

      render() {
        return (
          <div className="flex flex-col bg-gray-900  p-3 w-100 h-screen w-full shadow-xl  text-white  ">
            <div className="flex w-full mb-2">
              <div className="text-xl flex-grow ">
                Personas
              </div>
              <div >
                <button onClick={() => this.props.close()}> <i className="material-icons ">clear</i></button>
              </div>
            </div>
            <div className="overflow-y-auto">

              {(() => {
                switch (parent.props.pageState.page) {
                  case "all":
                    return (
                      <div>
                        {(!parent.props.viewOnly || parent.props.demo) &&
                          <div className="font-medium mb-2 underline">
                            <DarkButton primary handleOnClick={() => parent.props.setPageState({ page: "create", workflowId: "", workflowTitle: "" })}>Create new</DarkButton>
                          </div>}


                        {parentProps.personas.map((p, key) => {
                          return (
                            <div key={key}>

                              <div className="bg-gray-800 p-2 mb-2 flex" style={{ cursor: 'pointer' }} onClick={() => parent.props.setPageState({ page: "persona", personaId: p.id, edit: false })}>

                                <div className="mr-6"><img alt="Persona avatar" width="20px" src={avatar(p.avatar)}></img></div>

                                <div className="flex flex-col" >
                                  <div className=" font-medium "> {p.name}</div>
                                  <div className="italic "> {p.role}</div>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                      </div>)
                  case "persona":
                    const p = getPersona(parentProps.personas, parent.props.pageState.personaId)

                    type form = { avatar: string, name: string, role: string, description: string }

                    return (
                      <div className=" w-full max-w-lg">
                        {parent.props.pageState.edit ?

                          <Formik
                            initialValues={{ avatar: p.avatar, name: p.name, role: p.role, description: p.description }}

                            validationSchema={Yup.object().shape({
                              avatar: Yup.string()
                                .required('Required.'),
                              name: Yup.string()
                                .min(1, 'Minimum 1 characters.')
                                .max(200, 'Maximum 200 characters.')
                                .required('Required.'),
                              role: Yup.string()
                                .max(200, 'Maximum 200 characters.'),
                              description: Yup.string()
                                .max(10000, 'Maximum 10000 characters.')
                            })}

                            onSubmit={(values: form, actions: FormikHelpers<form>) => {

                              const opt: IPersona = {
                                workspaceId: parent.props.workspaceId,
                                projectId: parent.props.projectId,
                                id: p.id,
                                name: values.name,
                                role: values.role,
                                avatar: values.avatar,
                                description: values.description,
                                createdAt: new Date().toISOString()
                              }


                              parent.props.updatePersona(opt) //optimistic

                              if (!parent.props.demo) {
                                API_UPDATE_PERSONA(parent.props.workspaceId, p.id, values.avatar, values.name, values.role, values.description)
                                  .then(response => {
                                    if (response.ok) {

                                    } else {
                                      alert("something went wrong when editing persona")
                                    }
                                  })

                              }



                              parent.props.setPageState({ page: "persona", personaId: p.id, edit: false })


                              actions.setSubmitting(false)
                            }}
                          >
                            {(formikBag: FormikProps<form>) => (
                              <Form className="p-1">
                                {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}


                                <div className="flex flex-col    items-baseline sm:flex-row">
                                  <div className=" flex flex-col ">
                                    <div className="flex flex-wrap">
                                      {["avatar00", "avatar01", "avatar02", "avatar03", "avatar04", "avatar05", "avatar06", "avatar07", "avatar08"].map((a, key) =>
                                        <div key={key} className={"p-2 border mr-2 mb-2 rounded border-gray-800 " + (formikBag.values.avatar === a ? "bg-gray-200" : "bg-gray-700")}><button type="button" onClick={() => { formikBag.setFieldTouched("avatar", true); formikBag.setFieldValue("avatar", a) }} ><img alt="Persona avatar" width="25px" src={avatar(a)}></img> </button></div>
                                      )}
                                    </div>
                                  </div>
                                </div>


                                <Field name="avatar" className="invisible" />

                                <div className="flex  flex-row items-baseline">
                                  <div className=" flex flex-col w-full">
                                    <div className="font-medium text-gray-300">Name</div>
                                    <div>
                                      <Field autoFocus name="name" className="w-full rounded  p-1 border border-gray-500 bg-gray-900 	" placeholder="E.g. John Smith" />
                                      <div className="m-1 text-red-500 text-xs font-bold"><ErrorMessage name="name" /></div>
                                    </div>
                                  </div>
                                </div>


                                <div className="flex  flex-row items-baseline">
                                  <div className=" flex flex-col w-full">
                                    <div className="font-medium text-gray-300">Role</div>
                                    <div>
                                      <Field name="role" className="w-full rounded  p-1 border border-gray-500 bg-gray-900 	" placeholder="E.g. shopper, influencer, CEO, admin..." />
                                      <div className="m-1 text-red-500 text-xs font-bold"><ErrorMessage name="role" /></div>
                                    </div>
                                  </div>
                                </div>


                                <div className="flex  flex-row items-baseline">
                                  <div className=" flex flex-col w-full">
                                    <div className="font-medium text-gray-300">Description</div>
                                    <div>
                                      <Field rows={15} as="textarea" name="description" className="w-full rounded  p-1 border border-gray-500 bg-gray-900 	" placeholder="Describe behaviors, needs and goals..." />
                                      <div className="m-1 text-red-500 text-xs font-bold"><ErrorMessage name="description" /></div>
                                    </div>
                                  </div>
                                </div>


                                <div className="flex justify-end  ">
                                  <DarkButton handleOnClick={() => parent.props.setPageState({ page: "persona", personaId: p.id, edit: false })}>Cancel</DarkButton>
                                  <div className="ml-2"></div>
                                  <DarkButton primary submit>Save</DarkButton>
                                </div>
                              </Form>
                            )}
                          </Formik>

                          :

                          <div>
                            <div className="font-medium mb-2 underline">
                              <DarkButton handleOnClick={() => parent.props.setPageState({ page: "all" })}>All personas</DarkButton>
                            </div>
                            <div className="flex mb-2">
                              <div className="bg-gray-800 p-2  flex flex-grow" >

                                <div className="mr-6 flex flex-shrink-0 justify-items-start items-start"><img alt="Persona avatar" width="30px" src={avatar(p.avatar)}></img></div>

                                <div className="flex flex-col" >
                                  <div className=" text-xl "> {p.name}</div>
                                  <div className="italic "> {p.role}</div>

                                  <div className="mt-2">
                                    <div className="markdown-body  text-white">
                                      <ReactMarkdown source={p.description} linkTarget="_blank" />
                                    </div>
                                  </div>

                                </div>
                              </div>
                              <div className="bg-gray-800">
                                {(!parent.props.viewOnly || parent.props.demo) &&

                                  <ContextMenu icon="more_horiz">
                                    <div className="rounded bg-white shadow-md  absolute mt-8 top-0 right-0 min-w-full text-xs" >
                                      <ul className="list-reset">
                                        <li><Button noborder title="Delete" icon="delete" warning handleOnClick={() => parent.handleDeletePersona(p.id)} /></li>
                                      </ul>
                                    </div>
                                  </ContextMenu>
                                }


                              </div>
                            </div>

                            {(!parent.props.viewOnly || parent.props.demo) &&
                              <div>
                                <DarkButton primary handleOnClick={() => parent.props.setPageState({ page: "persona", personaId: p.id, edit: true })}> <i style={{ fontSize: "18px" }} className="material-icons align-middle" > edit</i > Edit persona </DarkButton>
                              </div>}

                          </div>
                        }
                      </div>
                    )
                  case "create":

                    const workflowId = parent.props.pageState.workflowId

                    return <div>

                      <h1>Create new persona {parent.props.pageState.workflowId !== "" ? <span>and add to goal <b>{parent.props.pageState.workflowTitle}</b></span> : ""}</h1>

                      <Formik
                        initialValues={{ avatar: "avatar00", name: "", role: "", description: "" }}

                        validationSchema={Yup.object().shape({
                          avatar: Yup.string()
                            .required('Required.'),
                          name: Yup.string()
                            .min(1, 'Minimum 1 characters.')
                            .max(200, 'Maximum 200 characters.')
                            .required('Required.'),
                          role: Yup.string()
                            .max(200, 'Maximum 200 characters.'),
                          description: Yup.string()
                            .max(10000, 'Maximum 10000 characters.')
                        })}

                        onSubmit={(values: form, actions: FormikHelpers<form>) => {

                          const optimisticPersona: IPersona = {
                            workspaceId: parent.props.workspaceId,
                            projectId: parent.props.projectId,
                            id: uuid(),
                            name: values.name,
                            role: values.role,
                            avatar: values.avatar,
                            description: values.description,
                            createdAt: new Date().toISOString()
                          }


                          parent.props.createPersona(optimisticPersona) //optimistic

                          const workflowPersonaId = uuid()

                          if (!parent.props.demo) {
                            API_CREATE_PERSONA(optimisticPersona.workspaceId, optimisticPersona.projectId, optimisticPersona.id, optimisticPersona.avatar, optimisticPersona.name, optimisticPersona.role, optimisticPersona.description, workflowId, workflowPersonaId)
                              .then(response => {
                                if (response.ok) {

                                } else {
                                  alert("something went wrong when creating persona")
                                }
                              })
                          }

                          if (workflowId !== "") {

                            const optimisticWorkflowPersona: IWorkflowPersona = {
                              id: workflowPersonaId,
                              personaId: optimisticPersona.id,
                              projectId: optimisticPersona.projectId,
                              workflowId: workflowId,
                              workspaceId: parent.props.workspaceId,
                            }

                            parent.props.createWorkflowPersona(optimisticWorkflowPersona)
                          }

                          parent.props.setPageState({ page: "all" })

                          actions.setSubmitting(false)
                        }}
                      >
                        {(formikBag: FormikProps<form>) => (
                          <Form className="p-1">
                            {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}


                            <div className="flex flex-col    items-baseline sm:flex-row">
                              <div className=" flex flex-col ">
                                <div className="flex flex-wrap">
                                  {["avatar00", "avatar01", "avatar02", "avatar03", "avatar04", "avatar05", "avatar06", "avatar07", "avatar08"].map((a, key) =>
                                    <div key={key} className={"p-2 border mr-2 mb-2 rounded border-gray-800 " + (formikBag.values.avatar === a ? "bg-gray-200" : "bg-gray-700")}><button type="button" onClick={() => { formikBag.setFieldTouched("avatar", true); formikBag.setFieldValue("avatar", a) }} ><img alt="Persona avatar" width="25px" src={avatar(a)}></img> </button></div>
                                  )}
                                </div>
                              </div>
                            </div>


                            <Field name="avatar" className="invisible" />

                            <div className="flex  flex-row items-baseline">
                              <div className=" flex flex-col w-full">
                                <div className="font-medium text-gray-300">Name</div>
                                <div>
                                  <Field autoFocus name="name" className="w-full rounded  p-1 border border-gray-500 bg-gray-900 	" placeholder="E.g. John Smith" />
                                  <div className="m-1 text-red-500 text-xs font-bold"><ErrorMessage name="name" /></div>
                                </div>
                              </div>
                            </div>


                            <div className="flex  flex-row items-baseline">
                              <div className=" flex flex-col w-full">
                                <div className="font-medium text-gray-300">Role</div>
                                <div>
                                  <Field name="role" className="w-full rounded  p-1 border border-gray-500 bg-gray-900 	" placeholder="E.g. shopper, influencer, CEO, admin..." />
                                  <div className="m-1 text-red-500 text-xs font-bold"><ErrorMessage name="role" /></div>
                                </div>
                              </div>
                            </div>


                            <div className="flex  flex-row items-baseline">
                              <div className=" flex flex-col w-full">
                                <div className="font-medium text-gray-300">Description</div>
                                <div>
                                  <Field rows={15} as="textarea" name="description" className="w-full rounded  p-1 border border-gray-500 bg-gray-900 	" placeholder="Describe behaviors, needs and goals." />
                                  <div className="m-1 text-red-500 text-xs font-bold"><ErrorMessage name="description" /></div>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end  ">

                              <DarkButton handleOnClick={() => parent.props.setPageState({ page: "all" })}>Cancel</DarkButton>
                              <div className="ml-2"></div>
                              <DarkButton primary submit>CREATE</DarkButton>
                            </div>

                          </Form>
                        )}
                      </Formik>
                    </div>

                  default:
                    break;
                }
              })()
              }

            </div>
          </div>
        )

      }

    }

    const DialogWithClickOutside = OnClickOut(Dialog)

    return (
      <div className=" w-full max-w-xl flex fixed  z-10  right-0 top-0   text-sm">
        <DialogWithClickOutside close={this.props.close} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Personas)
