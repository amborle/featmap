import { Button } from './elements'
import React, { Component } from 'react';
import EmptyCard from './EmptyCard';
import { IWorkflow } from '../store/workflows/types';
import { moveFeatureAction, updateFeatureAction } from '../store/features/actions';
import { moveMilestoneAction, updateMilestoneAction } from '../store/milestones/actions';
import { moveWorkflow, updateWorkflow } from '../store/workflows/actions';
import { moveSubWorkflowAction, updateSubWorkflowAction } from '../store/subworkflows/actions';
import { AppState } from '../store'
import {
  filterClosedSubWorkflows,
  filterOutClosedSubWorkflows,
  getSubWorkflowByWorkflow
} from '../store/subworkflows/selectors';
import { filterFeaturesOnMilestoneAndSubWorkflow, filterFeaturesOnMilestone, filterFeaturesOnSubWorkflow } from '../store/features/selectors';
import { application } from '../store/application/selectors';
import { connect } from 'react-redux'
import { IFeature } from '../store/features/types';
import { ISubWorkflow } from '../store/subworkflows/types';
import { IMilestone } from '../store/milestones/types';
import { DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot, DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { IApplication } from '../store/application/types';
import CreateCardModal from './CreateCardModal';
import Card from './Card';
import { Types } from './CreateCardModal';
import { API_MOVE_MILESTONE, API_MOVE_FEATURE, API_MOVE_SUBWORKFLOW, API_MOVE_WORKFLOW, API_DELETE_WORKFLOWPERSONA, API_CREATE_WORKFLOWPERSONA } from '../api';
import NewCard from './NewCard';
import { personaBarState } from '../core/misc';
import NewDimCard from './NewDimCard';
import { filterClosedWorkflows, filterOutClosedWorkflows } from "../store/workflows/selectors";
import { IFeatureComment } from '../store/featurecomments/types';
import { filterFeatureCommentsOnFeature } from '../store/featurecomments/selectors';
import Personas from './Personas';
import ContextMenu from './ContextMenu';
import { IPersona } from '../store/personas/types';
import { IWorkflowPersona } from '../store/workflowpersonas/types';
import { filterWorkflowPersonasOnWorkflow } from '../store/workflowpersonas/selectors';
import { getPersona, removeSpecificPersonas, sortPersonas } from '../store/personas/selectors';
import { deleteWorkflowPersona, createWorkflowPersona } from '../store/workflowpersonas/actions';
import { avatar } from '../avatars/';
import { v4 as uuid } from 'uuid'
import { filterClosedMilestones, filterOpenMilestones } from '../store/milestones/selectors';


interface SelfProps {
  projectId: string
  workspaceId: string
  milestones: IMilestone[]
  subWorkflows: ISubWorkflow[]
  workflows: IWorkflow[]
  features: IFeature[]
  comments: IFeatureComment[]
  personas: IPersona[]
  workflowPersonas: IWorkflowPersona[]
  url: string,
  viewOnly: boolean
  showClosed: boolean
  demo: boolean
  showPersonas: boolean
  closePersonas: () => void
  openPersonas: () => void
}

interface PropsFromState {
  application: IApplication
}

interface PropsFromDispatch {
  moveFeature: typeof moveFeatureAction
  moveMilestone: typeof moveMilestoneAction
  updateMilestone: typeof updateMilestoneAction
  moveSubWorkflow: typeof moveSubWorkflowAction
  updateSubWorkflow: typeof updateSubWorkflowAction
  moveWorkflow: typeof moveWorkflow
  updateWorkflow: typeof updateWorkflow
  deleteWorkflowPersona: typeof deleteWorkflowPersona
  createWorkflowPersona: typeof createWorkflowPersona
}

interface State {
  showCreateFeatureModal: boolean
  createFeatureModalMilestoneId: string
  createFeatureModalSubWorkflowId: string
  showCreateMilestoneModal: boolean
  showCreateWorkflowModal: boolean
  showCreateSubWorkflowModal: boolean
  createSubWorkflowWorkflowId: string
  showClosedMilestones: boolean
  personaBarState: personaBarState
}

const mapStateToProps = (state: AppState) => ({
  application: application(state)
})

const mapDispatchToProps = {
  moveFeature: moveFeatureAction,
  updateMilestone: updateMilestoneAction,
  moveMilestone: moveMilestoneAction,
  moveSubWorkflow: moveSubWorkflowAction,
  updateSubWorkflow: updateSubWorkflowAction,
  moveWorkflow,
  updateWorkflow,
  deleteWorkflowPersona,
  createWorkflowPersona
}

type Props = PropsFromState & PropsFromDispatch & SelfProps

class Board extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showCreateFeatureModal: false,
      createFeatureModalMilestoneId: "",
      createFeatureModalSubWorkflowId: "",
      showCreateMilestoneModal: false,
      showCreateWorkflowModal: false,
      showCreateSubWorkflowModal: false,
      createSubWorkflowWorkflowId: "",
      showClosedMilestones: false,
      personaBarState: { page: "all" }

    };
  }

  // Features
  openCreateFeatureModal = (milestoneId: string, subWorkflowId: string) => {
    this.setState(state => ({
      showCreateFeatureModal: !state.showCreateFeatureModal,
      createFeatureModalMilestoneId: milestoneId,
      createFeatureModalSubWorkflowId: subWorkflowId
    }))
  }
  closeCreateFeatureModal = () => {
    this.setState(state => ({
      showCreateFeatureModal: false
    }))
  }

  handleMilestoneMove = (id: string, workspaceId: string, index: number) => {

  }
  // Common

  onDragEnd = (result: DropResult): void => {

    const { draggableId, type, destination } = result;

    const t = new Date().toISOString()
    const by = this.props.application.account === undefined ? "demo" : this.props.application.account!.name
    if (!destination) {
      return;
    }


    switch (type) {
      case "FEATURE": {
        const { rid, wid } = this.getMilestoneAndSubWorkflowFromFeatureDroppableId(destination.droppableId)

        const fid = this.getFeatureFromDraggableId(draggableId)

        this.props.moveFeature({ id: fid, toMilestoneId: rid, toSubWorkflowId: wid, index: destination.index, ts: t, by: by }) // optimisic move

        if (this.props.demo) {
          return
        }
        API_MOVE_FEATURE(this.props.workspaceId, fid, wid, rid, destination.index)
          .then(response => {
            if (response.ok) {
              response.json().then((data: IFeature) => {
                updateFeatureAction(data)
              })
            } else {
              alert("Something went wrong when moving feature.")
            }
          }
          )
        break
      }

      case "MILESTONE": {
        // A milestone move is also triggered when a feature is moved, we need to ignore it. This is due to an issue with the drag-and-drop framework.
        if (!this.isMilestoneDraggable(draggableId)) {
          return
        }
        const milestoneId = this.getMilestoneFromDraggableId(draggableId)
        this.props.moveMilestone({ id: milestoneId, index: destination.index, ts: t, by: by }) // optimisic move

        if (this.props.demo) {
          return
        }
        API_MOVE_MILESTONE(this.props.workspaceId, milestoneId, destination.index)
          .then(response => {
            if (response.ok) {
              response.json().then((data: IMilestone) => {
                updateMilestoneAction(data)
              })
            } else {
              alert("Something went wrong when moving milestone.")
            }
          }
          )
        break
      }

      case "WORKFLOW": {
        const wid = this.getWorkflowFromDraggableId(draggableId)
        this.props.moveWorkflow({ id: wid, index: destination.index, ts: t, by: by }) // optimisic move

        if (this.props.demo) {
          return
        }
        API_MOVE_WORKFLOW(this.props.workspaceId, wid, destination.index)
          .then(response => {
            if (response.ok) {
              response.json().then((data: IWorkflow) => {
                updateWorkflow(data)
              })
            } else {
              alert("Something went wrong when moving card.")
            }
          }
          )

        break
      }

      case "SUBWORKFLOW": {
        const swid = this.getSubWorkflowFromDraggableId(draggableId)
        const wid = this.getWorkflowFromDroppableId(destination.droppableId)
        this.props.moveSubWorkflow({ id: swid, toWorkflowId: wid, index: destination.index, ts: t, by: by }) // optimisic move

        if (this.props.demo) {
          return
        }
        API_MOVE_SUBWORKFLOW(this.props.workspaceId, swid, wid, destination.index)
          .then(response => {
            if (response.ok) {
              response.json().then((data: ISubWorkflow) => {
                updateSubWorkflowAction(data)
              })
            } else {
              alert("Something went wrong when moving card.")
            }
          }
          )

        break
      }

      default:
    }

    this.setState({ showClosedMilestones: false })
  }

  getListStyle = (isDraggingOver: boolean): {} => ({
    background: isDraggingOver ? '#DAE1E7' : '',
  });

  getItemStyle = (isDragging: boolean, draggableStyle: any): {} => ({
    background: isDragging ? '#51D88A' : '',

    // styles we need to apply on draggables
    ...draggableStyle
  });

  getMilestoneAndSubWorkflowFromFeatureDroppableId = (id: string): { rid: string; wid: string } => {
    const res = id.split("*")
    return { rid: res[1], wid: res[2] }
  }

  getFeatureFromDraggableId = (id: string): string => {
    const res = id.split("*", 2)
    return res[1]
  }

  isMilestoneDraggable = (id: string): boolean => {
    const res = id.split("*")
    return res[0] === "m"
  }

  getMilestoneFromDraggableId = (id: string): string => {
    const res = id.split("*", 2)
    return res[1]
  }

  getSubWorkflowFromDraggableId = (id: string): string => {
    const res = id.split("*", 2)
    return res[1]
  }

  getWorkflowFromDraggableId = (id: string): string => {
    const res = id.split("*", 2)
    return res[1]
  }

  getWorkflowFromDroppableId = (id: string): string => {
    const res = id.split("*")
    return res[1]
  }

  handleDeleteWorkflowPersona = (workspaceId: string, workflowPersonaId: string) => {

    this.props.deleteWorkflowPersona(workflowPersonaId) // optimistic

    if (this.props.demo) {
      return
    }
    API_DELETE_WORKFLOWPERSONA(this.props.workspaceId, workflowPersonaId)
      .then(response => {
        if (response.ok) {
        } else {
          alert("Something went wrong when removing persona from goal.")
        }
      }
      )

  }

  handleCreateWorkflowPersona = (workspaceId: string, projectId: string, workflowId: string, personaId: string) => {

    const id = uuid()

    const wp: IWorkflowPersona = {
      id,
      personaId,
      projectId,
      workflowId,
      workspaceId
    }

    this.props.createWorkflowPersona(wp) // optimistic

    if (this.props.demo) {
      return
    }
    API_CREATE_WORKFLOWPERSONA(this.props.workspaceId, id, workflowId, personaId)
      .then(response => {
        if (response.ok) {
        } else {
          alert("Something went wrong when adding the persona to the goal.")
        }
      }
      )
  }



  render() {
    const { projectId, features, workflows, milestones, subWorkflows } = this.props

    const isEmpty = workflows.length === 0 && milestones.length === 0

    const viewOnly = this.props.viewOnly && !this.props.demo



    const PersonaTag = (name: string, role: string, avatarname: string, wsid: string, id: string, handleOpen: () => void, handleRemove: (wsid: string, id: string) => void, viewOnly: boolean, demo: boolean) => (
      <div>

        <div style={{ fontSize: '.70rem' }} className="w-32 inline-block p-1 mb-1  bg-gray-100   text-xs items-center  rounded whitespace-nowrap  " >
          <div className="flex items-center">
            <div className="flex flex-shrink-0"> <button onClick={() => handleOpen()}> <img alt="Persona avatar" width="12px" src={avatar(avatarname)}></img></button> </div>

            <div className="flex flex-grow flex-col overflow-hidden">
              <div className="ml-2    overflow-hidden"><button className="font-medium" onClick={() => handleOpen()}>{name}</button></div>
              <div className="ml-2 italic   overflow-hidden">{role}</div>
            </div>

            {(!viewOnly || demo) &&
              <div>
                {<button onClick={() => handleRemove(wsid, id)}><i style={{ fontSize: "14px" }} className="ml-1 material-icons text-gray-700 align-middle">clear</i></button>}
              </div>}

          </div>
        </div>
      </div>
    )

    // const avatar01 = require("../avatars/avatar01.svg") as string;

    return (
      <div className="z-0   ">
        <DragDropContext onDragStart={() => this.setState({ showClosedMilestones: true })} onDragEnd={this.onDragEnd}>
          <div >
            {this.state.showCreateMilestoneModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.MILESTONE, payload: {} }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateMilestoneModal: false })} /> : null}
            {this.state.showCreateWorkflowModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.WORKFLOW, payload: {} }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateWorkflowModal: false })} /> : null}
            {this.state.showCreateSubWorkflowModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.SUBWORKFLOW, payload: { workflowId: this.state.createSubWorkflowWorkflowId } }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateSubWorkflowModal: false })} /> : null}
            {this.state.showCreateFeatureModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.FEATURE, payload: { subWorkflowId: this.state.createFeatureModalSubWorkflowId, milestoneId: this.state.createFeatureModalMilestoneId } }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateFeatureModal: false })} /> : null}
            {this.props.showPersonas ? <Personas
              viewOnly={this.props.viewOnly}
              pageState={this.state.personaBarState}
              setPageState={(state: personaBarState) => this.setState({ personaBarState: state })}
              personas={this.props.personas} demo={this.props.demo} workspaceId={this.props.workspaceId} projectId={projectId} close={() => { this.setState({ personaBarState: { page: "all" } }); this.props.closePersonas() }} /> : null}
            {
              isEmpty ?

                viewOnly ?
                  <div className={"p-2"}>
                    This story map is empty.
                      </div>
                  :

                  <div className={"p-2"}>
                    <p>
                      <Button primary title="Add goal" icon="add" noborder handleOnClick={() => this.setState({ showCreateWorkflowModal: true })} />
                    </p>
                    <p>This board is empty, please start by adding a <b>user goal</b>. If you are new to user story mapping, have a look at <em><a className="link" target={"_blank"} rel="noopener noreferrer" href={"http://www.featmap.com/storymapping"}>An introduction to story mapping</a></em> or an <a className="link" rel="noopener noreferrer" target={"_blank"} href={"https://app.featmap.com/link/e31ddff9-7138-4db7-b340-af0c2217b417?demo=1"}>example story map</a>.</p>

                  </div>

                :
                <div>
                  <Droppable droppableId={"w"} type="WORKFLOW" direction="horizontal">
                    {(providedDroppable: DroppableProvided, snapshotDroppable: DroppableStateSnapshot) => {

                      var ww = workflows
                      if (!this.props.showClosed) {
                        ww = filterOutClosedWorkflows(ww)
                      }

                      return (
                        <div className="flex">
                          <div className="flex    border-b-2    "
                            ref={providedDroppable.innerRef}
                            {...providedDroppable.droppableProps}
                            style={this.getListStyle(snapshotDroppable.isDraggingOver)}>
                            <div className="flex flex-row w-full">
                              <div className=" p-1 pr-2">
                                <EmptyCard />
                              </div>

                              {
                                ww.map((w, index) => {
                                  var ss = getSubWorkflowByWorkflow(subWorkflows, w.id)
                                  const estimate = ss.flatMap(s => filterFeaturesOnSubWorkflow(features, s.id)).map(x => x.estimate).reduce((p, c) => p + c, 0)

                                  if (!this.props.showClosed) {
                                    ss = filterOutClosedSubWorkflows(ss)
                                  }

                                  return [
                                    <Draggable
                                      isDragDisabled={viewOnly}
                                      key={w.id}
                                      draggableId={"w*" + w.id}
                                      index={index}>
                                      {(providedDraggable: DraggableProvided, snapshotDraggable: DraggableStateSnapshot) => (
                                        <div key={w.id} className="bug flex p-1   "
                                          ref={providedDraggable.innerRef}
                                          {...providedDraggable.draggableProps}
                                          {...providedDraggable.dragHandleProps}
                                          style={this.getItemStyle(
                                            snapshotDraggable.isDragging,
                                            providedDraggable.draggableProps.style
                                          )}>

                                          <div className="flex flex-col  ">
                                            <div className="flex flex-grow"></div>
                                            <div className="flex flex-col p-1 ">
                                              {filterWorkflowPersonasOnWorkflow(this.props.workflowPersonas, w.id).map((wp, key) => {
                                                const p = getPersona(this.props.personas, wp.personaId)
                                                if (p === null || p === undefined) {
                                                  return null
                                                }
                                                return <div key={key}>{PersonaTag(p.name, p.role, p.avatar, this.props.workspaceId, wp.id, () => { this.props.openPersonas(); this.setState({ personaBarState: { page: "persona", edit: false, personaId: p.id } }) }, this.handleDeleteWorkflowPersona, this.props.viewOnly, this.props.demo)}</div>
                                              }
                                              )}

                                              {(!this.props.viewOnly || this.props.demo) &&

                                                <ContextMenu smallIcon text="Persona" icon="add">
                                                  <div className="rounded bg-white shadow-md  absolute mt-8 top-0 left-0  text-xs  max-w-xs w-full" >
                                                    <ul className="list-reset p-3">


                                                      {sortPersonas(removeSpecificPersonas(this.props.personas, filterWorkflowPersonasOnWorkflow(this.props.workflowPersonas, w.id).map(x => x.personaId))).map((p, key) =>
                                                        <li key={key}>
                                                          <button className="w-full" onClick={() => this.handleCreateWorkflowPersona(this.props.workspaceId, this.props.projectId, w.id, p.id)}><div className="p-1 flex w-full"><img className="align-middle mr-2" alt="Persona avatar" width="12px" src={avatar(p.avatar)}></img><span className="mr-2 font-medium whitespace-nowrap overflow-hidden ">{p.name} </span></div></button>


                                                        </li>

                                                      )}
                                                      <li>
                                                        <div className="p-1"><button onClick={() => {
                                                          this.setState({ personaBarState: { page: "create", workflowId: w.id, workflowTitle: w.title } })
                                                          this.props.openPersonas()
                                                        }}><span className="font-medium">Create new...</span> </button>

                                                        </div>
                                                      </li>

                                                    </ul>
                                                  </div>
                                                </ContextMenu>

                                              }

                                            </div>
                                            <div className="flex  m-1 ">

                                              <Card estimate={estimate} annotations={w.annotations} status={w.status} color={w.color} title={w.title} link={this.props.url + "/w/" + w.id} /></div>
                                            <div className="flex flex-row fm-paren ">
                                              <Droppable key={"w" + w.id} droppableId={"sw*" + w.id} type="SUBWORKFLOW" direction="horizontal">
                                                {(providedDroppable: DroppableProvided, snapshotDroppable: DroppableStateSnapshot) => {

                                                  return (
                                                    <div className="flex flex-row showhim "
                                                      ref={providedDroppable.innerRef}
                                                      {...providedDroppable.droppableProps}
                                                      style={this.getListStyle(snapshotDroppable.isDraggingOver)}>

                                                      {ss.length === 0 ?
                                                        <div className="text-xs p-1">
                                                          {viewOnly ?
                                                            <EmptyCard />
                                                            :
                                                            <NewCard>
                                                              <Button title="Add activity" icon="add" noborder handleOnClick={() => this.setState({ showCreateSubWorkflowModal: true, createSubWorkflowWorkflowId: w.id })} />
                                                            </NewCard>}
                                                        </div>
                                                        : null}

                                                      {ss.map((sw, index) => {

                                                        const estimate = filterFeaturesOnSubWorkflow(features, sw.id).map(x => x.estimate).reduce((p, c) => p + c, 0)
                                                        return [
                                                          <Draggable
                                                            isDragDisabled={viewOnly}
                                                            key={sw.id}
                                                            draggableId={"sw*" + sw.id}
                                                            index={index}>
                                                            {(providedDraggable: DraggableProvided, snapshotDraggable: DraggableStateSnapshot) => (
                                                              <div>
                                                                <div className="bug flex p-1 "
                                                                  ref={providedDraggable.innerRef}
                                                                  {...providedDraggable.draggableProps}
                                                                  {...providedDraggable.dragHandleProps}
                                                                  style={this.getItemStyle(
                                                                    snapshotDraggable.isDragging,
                                                                    providedDraggable.draggableProps.style
                                                                  )}>
                                                                  <div className="flex  w-full">
                                                                    <Card estimate={estimate} annotations={sw.annotations} status={sw.status} color={sw.color} title={sw.title} link={this.props.url + "/sw/" + sw.id} />
                                                                  </div>

                                                                </div>
                                                              </div>
                                                            )}
                                                          </Draggable>

                                                        ]
                                                      })}

                                                      {this.props.viewOnly && !this.props.demo ?
                                                        <div className="flex mt-1 w-2 h-16  flex-no-shrink justify-center">
                                                        </div>
                                                        :
                                                        <div className="flex mt-1 w-2 h-16  flex-no-shrink justify-center">
                                                          <div className="flex font-bold text-xl showme"><button className=" hover:text-gray-800 text-gray-500" onClick={() => this.setState({ showCreateSubWorkflowModal: true, createSubWorkflowWorkflowId: w.id })}>+</button></div>
                                                        </div>
                                                      }
                                                      {providedDroppable.placeholder}

                                                    </div>
                                                  )

                                                }
                                                }
                                              </Droppable>
                                            </div>
                                          </div>


                                        </div>
                                      )}
                                    </Draggable>

                                  ]
                                }
                                )}
                              {providedDroppable.placeholder}

                              <div className="flex flex-col text-xs p-2">
                                <div className="flex flex-grow"></div>
                                <div>
                                  {!viewOnly &&
                                    <NewCard>
                                      <Button title="Add goal" icon="add" noborder handleOnClick={() => this.setState({ showCreateWorkflowModal: true })} />
                                    </NewCard>}
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      )

                    }
                    }
                  </Droppable>

                  <Droppable droppableId={"dm"} type="MILESTONE">
                    {(providedDroppable: DroppableProvided, snapshotDroppable: DroppableStateSnapshot) => {

                      return (
                        <div className="flex">
                          <div className="flex flex-col "
                            ref={providedDroppable.innerRef}
                            {...providedDroppable.droppableProps}
                            style={this.getListStyle(snapshotDroppable.isDraggingOver)}>
                            {
                              (!this.props.showClosed ? filterOpenMilestones(milestones) : milestones)
                                .map((m, index) => {

                                  var ww = workflows
                                  if (!this.props.showClosed) {
                                    ww = filterOutClosedWorkflows(ww)
                                  }
                                  return [
                                    <Draggable
                                      isDragDisabled={viewOnly}
                                      key={m.id}
                                      draggableId={"m*" + m.id}
                                      index={index}>
                                      {(providedDraggable: DraggableProvided, snapshotDraggable: DraggableStateSnapshot) => (
                                        <div key={m.id} className={"flex bug p-1   "}
                                          ref={providedDraggable.innerRef}
                                          {...providedDraggable.draggableProps}
                                          {...providedDraggable.dragHandleProps}
                                          style={this.getItemStyle(
                                            snapshotDraggable.isDragging,
                                            providedDraggable.draggableProps.style
                                          )}>

                                          <div className={"flex   pb-1  border-b border-dashed  "}>

                                            <div className={"flex  w-full  "}>
                                              <div className="p-1">
                                                {

                                                  (() => {
                                                    const f = filterFeaturesOnMilestone(features, m.id)
                                                    const fEstimate = f.map(x => x.estimate).reduce((p, c) => p + c, 0)

                                                    return <Card estimate={fEstimate} annotations={m.annotations}
                                                      nbrOfItems={f.length} color={m.color} status={m.status} title={m.title} link={this.props.url + "/m/" + m.id} />
                                                  }
                                                  )()
                                                }

                                              </div>

                                              {ww.map((w, index) => {

                                                var ss = getSubWorkflowByWorkflow(subWorkflows, w.id)
                                                if (!this.props.showClosed) {
                                                  ss = filterOutClosedSubWorkflows(ss)
                                                }


                                                return [
                                                  <div className={(index === 0) ? "flex flex-row pl-1 pr-1" : "flex flex-row pl-3 pr-1"} key={w.id}>
                                                    {ss.length === 0 ?
                                                      <div className="p-1">
                                                        <EmptyCard />
                                                      </div>
                                                      : null}

                                                    {
                                                      ss.map(sw => {
                                                        const ff = filterFeaturesOnMilestoneAndSubWorkflow(features, m.id, sw.id)
                                                        return [
                                                          <Droppable key={sw.id} droppableId={"df*" + m.id + "*" + sw.id} type="FEATURE">
                                                            {(providedDroppable: DroppableProvided, snapshotDroppable: DroppableStateSnapshot) => (
                                                              <div className="flex flex-col fm-paren showhim "
                                                                ref={providedDroppable.innerRef}
                                                                {...providedDroppable.droppableProps}
                                                                style={this.getListStyle(snapshotDroppable.isDraggingOver)}>
                                                                {ff.map((f, index) => {
                                                                  return [
                                                                    <Draggable
                                                                      isDragDisabled={viewOnly}
                                                                      key={f.id}
                                                                      draggableId={"f*" + f.id}
                                                                      index={index}>
                                                                      {(providedDraggable: DraggableProvided, snapshotDraggable: DraggableStateSnapshot) => (
                                                                        <div>

                                                                          <div className="p-1"
                                                                            ref={providedDraggable.innerRef}
                                                                            {...providedDraggable.draggableProps}
                                                                            {...providedDraggable.dragHandleProps}
                                                                            style={this.getItemStyle(
                                                                              snapshotDraggable.isDragging,
                                                                              providedDraggable.draggableProps.style
                                                                            )}>

                                                                            <Card estimate={f.estimate} annotations={f.annotations} nbrOfComments={filterFeatureCommentsOnFeature(this.props.comments, f.id).length} color={f.color} status={f.status} title={f.title} link={this.props.url + "/f/" + f.id} bottomLink={index === ff.length - 1 && !viewOnly ? () => this.setState({ showCreateFeatureModal: true, createFeatureModalMilestoneId: m.id, createFeatureModalSubWorkflowId: sw.id }) : undefined} />
                                                                          </div>
                                                                        </div>
                                                                      )}
                                                                    </Draggable>
                                                                  ]
                                                                }
                                                                )}
                                                                {providedDroppable.placeholder}

                                                                {
                                                                  ff.length === 0 ?
                                                                    <div className="flex  text-xs p-1">
                                                                      {!viewOnly ? <NewDimCard>
                                                                        <button className=" text-gray-400 text-2xl hover:text-gray-800" onClick={() => this.setState({ showCreateFeatureModal: true, createFeatureModalMilestoneId: m.id, createFeatureModalSubWorkflowId: sw.id })}>+</button>
                                                                      </NewDimCard>
                                                                        :
                                                                        <EmptyCard />
                                                                      }
                                                                    </div>
                                                                    : null

                                                                }

                                                              </div>
                                                            )}
                                                          </Droppable>
                                                        ]
                                                      })

                                                    }

                                                  </div>
                                                ]
                                              })}
                                            </div>

                                          </div>

                                        </div>

                                      )}

                                    </Draggable>

                                  ]
                                }
                                )
                            }
                            {providedDroppable.placeholder}
                            <div className="flex flex-col  p-2  text-sm ">

                              <div>
                                {!viewOnly && <NewCard>
                                  <Button title="Add release" icon="add" noborder handleOnClick={() => this.setState({ showCreateMilestoneModal: true })} />
                                </NewCard>}
                              </div>

                              {!this.props.showClosed &&

                                <div className="mt-2 italic">

                                  {(() => {
                                    const nbrOfClosedMilestones = filterClosedMilestones(milestones).length
                                    const nbrOfClosedWorkflows = filterClosedWorkflows(workflows).length
                                    const nbrOfClosedSubWorkflows = filterClosedSubWorkflows(subWorkflows).length

                                    if (nbrOfClosedMilestones > 0 || nbrOfClosedWorkflows > 0 || nbrOfClosedSubWorkflows > 0) {
                                      return "Closed cards not shown: "
                                    }
                                  })()}


                                  {(() => {
                                    const nbrOfClosedMilestones = filterClosedMilestones(milestones).length

                                    if (nbrOfClosedMilestones === 1) {
                                      return <span> <b> {nbrOfClosedMilestones}</b> release </span>
                                    }
                                    if (nbrOfClosedMilestones > 1) {
                                      return <span> <b> {nbrOfClosedMilestones}</b> releases </span>
                                    }
                                  })()
                                  }

                                  {(() => {
                                    const nbrOfClosedWorkflows = filterClosedWorkflows(workflows).length

                                    if (nbrOfClosedWorkflows === 1) {
                                      return <span> <b> {nbrOfClosedWorkflows}</b> goal</span>
                                    }
                                    if (nbrOfClosedWorkflows > 1) {
                                      return <span> <b> {nbrOfClosedWorkflows}</b> goals </span>
                                    }
                                  })()
                                  }


                                  {(() => {
                                    const nbrOfClosedSubWorkflows = filterClosedSubWorkflows(subWorkflows).length

                                    if (nbrOfClosedSubWorkflows === 1) {
                                      return <span> <b> {nbrOfClosedSubWorkflows}</b> activity</span>
                                    }
                                    if (nbrOfClosedSubWorkflows > 1) {
                                      return <span> <b> {nbrOfClosedSubWorkflows}</b> activities </span>
                                    }
                                  })()
                                  }

                                </div>
                              }




                            </div>
                          </div>

                        </div>


                      )

                    }
                    }
                  </Droppable>

                </div>

            }
          </div>

        </DragDropContext>
      </div >

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Board)
