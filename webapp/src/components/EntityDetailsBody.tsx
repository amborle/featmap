import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { deleteMilestone, updateMilestone, createMilestone } from '../store/milestones/actions';
import { deleteSubWorkflow, updateSubWorkflow, createSubWorkflow } from '../store/subworkflows/actions';
import { deleteWorkflow, updateWorkflow, createWorkflow } from '../store/workflows/actions';
import { deleteFeature, updateFeature, createFeature } from '../store/features/actions';
import { deleteProject, updateProject, createProject } from '../store/projects/actions';
import {
  API_DELETE_MILESTONE,
  API_DELETE_SUBWORKFLOW,
  API_DELETE_WORKFLOW,
  API_DELETE_FEATURE,
  API_DELETE_PROJECT,
  API_CLOSE_FEATURE,
  API_OPEN_FEATURE,
  API_CLOSE_MILESTONE,
  API_OPEN_MILESTONE,
  API_CHANGE_FEATURE_COLOR,
  API_CHANGE_MILESTONE_COLOR,
  API_CHANGE_WORKFLOW_COLOR,
  API_CHANGE_SUBWORKFLOW_COLOR,
  API_CLOSE_SUBWORKFLOW, API_OPEN_SUBWORKFLOW
} from "../api";
import TimeAgo from 'react-timeago'
import { Button } from './elements';
import { application } from '../store/application/selectors';
import { IApplication } from '../store/application/types';
import { EntityTypes } from '../core/card'
import CardDetailsTitle from './EntityDetailsTitle'
import CardDetailsDescription from './EntityDetailsDescription';
import { CardStatus, colorToBackgroundColorClass, Colors, colorToBorderColorClass, Color } from '../core/misc';
import ContextMenu from './ContextMenu';
import {RouteComponentProps, RouterProps} from "react-router";

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
  deleteProject,
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
  entity: EntityTypes
  url: string
  close: () => void
  viewOnly: boolean
  demo: boolean
}


type Props = & PropsFromState & PropsFromDispatch & SelfProps

interface State {
  copySuccess: boolean
  editTitle: boolean
}

interface formValues {
  title: string
}

class EntityDetailsBody extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { editTitle: false, copySuccess: false }
  }

  urlRef = React.createRef<HTMLInputElement>()

  copyToClipboard = (url: string) => {
    const listener = (e: ClipboardEvent) => {
      e.clipboardData!.setData('text/plain', url);
      e.preventDefault();
    }

    document.addEventListener('copy', listener)
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
    this.setState({ copySuccess: true })
  }

  handleDelete = () => {
    const card = this.props.entity

    switch (card.kind) {
      case "project": {
        this.props.deleteProject(card.id)
        if (!this.props.demo) {
          API_DELETE_PROJECT(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {


              } else {
                alert("Something went wrong.")
              }
            })
        }

        break;

      }


      case "milestone": {

        this.props.deleteMilestone(card.id)
        if (!this.props.demo) {
          API_DELETE_MILESTONE(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {

              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;

      }

      case "subworkflow": {

        this.props.deleteSubWorkflow(card.id)
        if (!this.props.demo) {
          API_DELETE_SUBWORKFLOW(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {

              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "workflow": {

        this.props.deleteWorkflow(card.id)
        if (!this.props.demo) {
          API_DELETE_WORKFLOW(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {

              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "feature": {

        this.props.deleteFeature(card.id)
        if (!this.props.demo) {
          API_DELETE_FEATURE(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {

              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }


      default:
        break;
    }
    this.props.close()
  }

  handleClose = () => {
    const card = this.props.entity

    switch (card.kind) {
      case "feature": {

        this.props.updateFeature({ ...card, status: CardStatus.CLOSED, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_CLOSE_FEATURE(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "milestone": {

        this.props.updateMilestone({ ...card, status: CardStatus.CLOSED, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_CLOSE_MILESTONE(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "subworkflow": {

        this.props.updateSubWorkflow({ ...card, status: CardStatus.CLOSED, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_CLOSE_SUBWORKFLOW(card.workspaceId, card.id)
              .then(response => {
                if (response.ok) {
                } else {
                  alert("Something went wrong.")
                }
              })
        }
        break;
      }

      default:
        break;
    }

    this.props.close()
  }

  handleOpen = () => {
    const card = this.props.entity

    switch (card.kind) {
      case "feature": {
        this.props.updateFeature({ ...card, status: CardStatus.OPEN, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_OPEN_FEATURE(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "milestone": {
        this.props.updateMilestone({ ...card, status: CardStatus.OPEN, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_OPEN_MILESTONE(card.workspaceId, card.id)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "subworkflow": {
        this.props.updateSubWorkflow({ ...card, status: CardStatus.OPEN, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_OPEN_SUBWORKFLOW(card.workspaceId, card.id)
              .then(response => {
                if (response.ok) {
                } else {
                  alert("Something went wrong.")
                }
              })
        }
        break;
      }

      default:
        break;
    }

  }


  handleChangeColor = (color: Color) => {
    const card = this.props.entity

    switch (card.kind) {
      case "feature": {

        this.props.updateFeature({ ...card, color: color, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_CHANGE_FEATURE_COLOR(card.workspaceId, card.id, color)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "milestone": {
        this.props.updateMilestone({ ...card, color: color, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_CHANGE_MILESTONE_COLOR(card.workspaceId, card.id, color)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "workflow": {
        this.props.updateWorkflow({ ...card, color: color, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_CHANGE_WORKFLOW_COLOR(card.workspaceId, card.id, color)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      case "subworkflow": {
        this.props.updateSubWorkflow({ ...card, color: color, lastModified: new Date().toISOString(), lastModifiedByName: this.props.application.account === undefined ? "demo" : this.props.application.account.name })
        if (!this.props.demo) {
          API_CHANGE_SUBWORKFLOW_COLOR(card.workspaceId, card.id, color)
            .then(response => {
              if (response.ok) {
              } else {
                alert("Something went wrong.")
              }
            })
        }
        break;
      }

      default:
        break;
    }
  }

  render() {
    let open = true
    switch (this.props.entity.kind) {
      case "milestone":
      case "subworkflow":
      case "feature":
        open = this.props.entity.status === CardStatus.OPEN
        break;
      default:
    }

    return (
      <div className="flex flex-col">
        <div className={"flex w-full h-4 " + (this.props.entity.kind === "project" ? "" : colorToBackgroundColorClass(this.props.entity.color))}/>
        <div className={"flex w-full h-full flex-row bg-white overflow-auto "}>

          <div className="flex flex-col w-full p-2  ">
            <CardDetailsTitle demo={this.props.demo} viewOnly={this.props.viewOnly} card={this.props.entity} app={this.props.application} url={this.props.url} close={this.props.close} />
            <CardDetailsDescription demo={this.props.demo} viewOnly={this.props.viewOnly} entity={this.props.entity} app={this.props.application} url={this.props.url} close={this.props.close} />
          </div>
          <div className="flex flex-col w-64 bg-gray-200 p-2">
            <div className="flex justify-end items-center">
              {!this.props.viewOnly ?
                <ContextMenu icon="more_horiz">
                  <div className="rounded bg-white shadow-md  absolute mt-8 top-0 right-0 min-w-full text-xs" >
                    <ul className="list-reset">
                      <li><Button noborder title="Delete" icon="delete" warning handleOnClick={this.handleDelete} /></li>
                    </ul>
                  </div>
                </ContextMenu>
                :
                null
              }
              <div>
                <button onClick={() => this.props.close()}> <i className="material-icons ">clear</i></button>
              </div>
            </div>
            <div className="flex flex-col text-xs">
              <div className=" mb-1 font-bold">
                Permalink
            </div>
              <div className="flex items-center flex-grow">
                <div className="flex flex-grow " ><input onClick={() => this.urlRef.current!.select()} ref={this.urlRef} readOnly className="p-1 w-full  border mr-1" value={ window.location.protocol + "//"  + window.location.host  + this.props.url} /></div>
                <div>
                  {document.queryCommandSupported('copy') && <button onClick={() => this.copyToClipboard(window.location.protocol + "//"  + window.location.host  + this.props.url)}><i style={{ fontSize: "16px" }} className="material-icons text-gray-800">file_copy</i></button>}
                </div>
                <div >
                  <i style={{ fontSize: "16px" }} className={"material-icons  text-green-500" + (!this.state.copySuccess ? " invisible" : "")}>check_circle</i>
                </div>
              </div>
            </div>

            {!this.props.viewOnly && open ?
              <div>

                {(() => {
                  switch (this.props.entity.kind) {
                    case "workflow":
                    case "subworkflow":
                    case "milestone":
                    case "feature": {
                      const color = this.props.entity.color
                      return <div className="flex flex-col text-xs mt-3 ">
                        <div className=" mb-1 font-bold">
                          Color</div>
                        <div className="flex items-center flex-grow">
                          <div className="flex flex-row">{
                            Colors.map(x => {
                              return [
                                <div key={x} className="flex flex-col  mr-1">
                                  <button onClick={() => this.handleChangeColor(x)} title={x} className={"flex h-3 w-3 border " + colorToBackgroundColorClass(x) + " " + colorToBorderColorClass(x)} />
                                  <div className="flex justify-center" >
                                    {(color === x) ? <div>●</div> : null}
                                  </div>
                                </div>
                              ]
                            })} </div>

                        </div>
                      </div>
                    }
                    default:
                  }
                })()
                }
              </div>
              :
              null
            }


            <div className="flex flex-col text-xs mt-3 ">
              <div className=" mb-1 font-bold">
                Created
            </div>
              <div className="flex items-center flex-grow">
                <span className="font-medium"><TimeAgo date={this.props.entity.createdAt} /> by {this.props.entity.createdByName}</span>
              </div>
            </div>
            <div className="flex flex-col text-xs mt-3 ">
              <div className=" mb-1 font-bold">
                Last modified
            </div>
              <div className="flex items-center flex-grow  ">
                <span className="font-medium"><TimeAgo date={this.props.entity.lastModified} /> by {this.props.entity.lastModifiedByName}</span>
              </div>
            </div>

            <div className="flex flex-col text-xs mt-3 ">
              <div className="flex items-center flex-grow  ">
                {!this.props.viewOnly ?
                  <div>
                    {(() => {
                      switch (this.props.entity.kind) {
                        //case "feature" || "milestone": {
                        case "milestone":
                        case "subworkflow":
                        case "feature":
                          if (this.props.entity.status === "OPEN") {
                            return <Button icon="check" iconColor="text-green-500" title="Close card" handleOnClick={this.handleClose} />
                          }
                          if (this.props.entity.status === "CLOSED") {
                            return <Button secondary title="Reopen card" handleOnClick={this.handleOpen} />
                          }

                          break;
                        default:

                      }
                    })()
                    }

                  </div>
                  :
                  null
                }
              </div>
            </div>
          </div>
        </div >
      </div>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityDetailsBody)
