import { Button } from './elements'
import React, { Component } from 'react';
import EmptyCard from './EmptyCard';
import { IWorkflow } from '../store/workflows/types';
import { moveFeature, updateFeature } from '../store/features/actions';
import { moveMilestone, updateMilestone } from '../store/milestones/actions';
import { moveWorkflow, updateWorkflow } from '../store/workflows/actions';
import { moveSubWorkflow, updateSubWorkflow } from '../store/subworkflows/actions';
import { AppState } from '../store'
import {
  filterOutClosedSubWorkflows, getNbrOfClosedSubWorkflows,
  getSubWorkflowByWorkflow
} from '../store/subworkflows/selectors';
import { filterFeaturesOnMilestoneAndSubWorkflow, filterFeaturesOnMilestone, closedFeatures } from '../store/features/selectors';
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
import { API_MOVE_MILESTONE, API_MOVE_FEATURE, API_MOVE_SUBWORKFLOW, API_MOVE_WORKFLOW } from '../api';
import NewCard from './NewCard';
import { CardStatus } from '../core/misc';
import NewDimCard from './NewDimCard';
import {filterOutClosedWorkflows} from "../store/workflows/selectors";


interface SelfProps {
  projectId: string
  workspaceId: string
  milestones: IMilestone[]
  subWorkflows: ISubWorkflow[]
  workflows: IWorkflow[]
  features: IFeature[]
  url: string,
  viewOnly: boolean
  showClosed: boolean
  demo: boolean
}

interface PropsFromState {
  application: IApplication
}

interface PropsFromDispatch {
  moveFeature: typeof moveFeature
  moveMilestone: typeof moveMilestone
  updateMilestone: typeof updateMilestone
  moveSubWorkflow: typeof moveSubWorkflow
  updateSubWorkflow: typeof updateSubWorkflow
  moveWorkflow: typeof moveWorkflow
  updateWorkflow: typeof updateWorkflow
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
}

const mapStateToProps = (state: AppState) => ({
  application: application(state)
})

const mapDispatchToProps = {
  moveFeature,
  updateMilestone,
  moveMilestone,
  moveSubWorkflow,
  updateSubWorkflow,
  moveWorkflow,
  updateWorkflow,
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
      showClosedMilestones: false
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
                updateFeature(data)
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
                updateMilestone(data)
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
                updateSubWorkflow(data)
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


  render() {
    const { projectId, features, workflows, milestones, subWorkflows } = this.props

    const isEmpty = workflows.length === 0 && milestones.length === 0

    const viewOnly = this.props.viewOnly && !this.props.demo

    return (
      <div className="z-0   ">

        <DragDropContext onDragStart={() => this.setState({ showClosedMilestones: true })} onDragEnd={this.onDragEnd}>
          <div >
            {this.state.showCreateMilestoneModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.MILESTONE, payload: {} }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateMilestoneModal: false })} /> : null}
            {this.state.showCreateWorkflowModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.WORKFLOW, payload: {} }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateWorkflowModal: false })} /> : null}
            {this.state.showCreateSubWorkflowModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.SUBWORKFLOW, payload: { workflowId: this.state.createSubWorkflowWorkflowId } }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateSubWorkflowModal: false })} /> : null}
            {this.state.showCreateFeatureModal ? <CreateCardModal demo={this.props.demo} action={{ type: Types.FEATURE, payload: { subWorkflowId: this.state.createFeatureModalSubWorkflowId, milestoneId: this.state.createFeatureModalMilestoneId } }} workspaceId={this.props.workspaceId} projectId={projectId} close={() => this.setState({ showCreateFeatureModal: false })} /> : null}
            {
              isEmpty?

                  viewOnly ?
                      <div className={"p-2"}>
                        This story map is empty.
                      </div>
                      :

                  <div className={"p-2"}>
                    <p>
                      <Button primary title="Add goal" icon="add" noborder handleOnClick={() => this.setState({ showCreateWorkflowModal: true })} />
                    </p>
                    <p>This board is empty, please start by adding a <b>user goal</b>. If you are new to user story mapping, have a look at <em><a className="link" target={"_blank"}  rel="noopener noreferrer" href={"http://www.featmap.com/storymapping"}>An introduction to story mapping</a></em> or an <a className="link"  rel="noopener noreferrer" target={"_blank"} href={"https://app.featmap.com/link/e31ddff9-7138-4db7-b340-af0c2217b417?demo=1"}>example story map</a>.</p>

                  </div>

                  :
                  <div>
                    <Droppable droppableId={"w"} type="WORKFLOW" direction="horizontal">
                      {(providedDroppable: DroppableProvided, snapshotDroppable: DroppableStateSnapshot) => {

                        var ww = workflows
                        if(!this.props.showClosed) {
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
                                    var nbrOfClosedSubWorkflows = 0
                                    if(!this.props.showClosed) {
                                      nbrOfClosedSubWorkflows =  getNbrOfClosedSubWorkflows(ss)
                                      ss = filterOutClosedSubWorkflows(ss)
                                    }

                                        return [
                                          <Draggable
                                              isDragDisabled={viewOnly}
                                              key={w.id}
                                              draggableId={"w*" + w.id}
                                              index={index}>
                                            {(providedDraggable: DraggableProvided, snapshotDraggable: DraggableStateSnapshot) => (
                                                <div key={w.id} className="bug flex p-1  "
                                                     ref={providedDraggable.innerRef}
                                                     {...providedDraggable.draggableProps}
                                                     {...providedDraggable.dragHandleProps}
                                                     style={this.getItemStyle(
                                                         snapshotDraggable.isDragging,
                                                         providedDraggable.draggableProps.style
                                                     )}>

                                                  <div className="flex flex-col bg-gray-100">
                                                    <div className="flex flex-grow m-1 "><Card status={w.status} bottomStatus={nbrOfClosedSubWorkflows > 0 ? nbrOfClosedSubWorkflows +" closed activities" :""} color={w.color} title={w.title} link={this.props.url + "/w/" + w.id} /></div>
                                                    <div className="flex flex-row fm-paren">
                                                      <Droppable key={"w" + w.id} droppableId={"sw*" + w.id} type="SUBWORKFLOW" direction="horizontal">
                                                        {(providedDroppable: DroppableProvided, snapshotDroppable: DroppableStateSnapshot) => {
                                                          
                                                            return (
                                                                <div className="flex flex-row"
                                                                     ref={providedDroppable.innerRef}
                                                                     {...providedDroppable.droppableProps}
                                                                     style={this.getListStyle(snapshotDroppable.isDraggingOver)}>

                                                                  {ss.length === 0 ?
                                                                      <div className="text-xs p-1">
                                                                        {viewOnly ?
                                                                            <EmptyCard/>
                                                                            :
                                                                            <NewCard>
                                                                              <Button title="Add activity" icon="add" noborder handleOnClick={() => this.setState({ showCreateSubWorkflowModal: true, createSubWorkflowWorkflowId: w.id })} />
                                                                            </NewCard>}
                                                                      </div>
                                                                      : null}

                                                                  {ss.map((sw, index) => {
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
                                                                                  <Card status={sw.status} color={sw.color} title={sw.title} link={this.props.url + "/sw/" + sw.id} rightLink={index === ss.length - 1 && !viewOnly ? () => this.setState({ showCreateSubWorkflowModal: true, createSubWorkflowWorkflowId: w.id }) : undefined} />
                                                                                </div>

                                                                              </div>                                                                              
                                                                            </div>
                                                                        )}
                                                                      </Draggable>

                                                                    ]
                                                                  })}
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

                                  <div className="text-xs p-2">
                                    {!viewOnly &&
                                    <NewCard>
                                      <Button title="Add goal" icon="add" noborder handleOnClick={() => this.setState({ showCreateWorkflowModal: true })} />
                                    </NewCard>}
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
                                  milestones
                                      .map((m, index) => {
                                            const closed = !this.props.showClosed && m.status === CardStatus.CLOSED

                                        var ww = workflows
                                        if(!this.props.showClosed) {
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

                                                      <div className={"flex  bg-gray-100 pb-1  border-b border-dashed  "}>
                                                        {
                                                          closed ?
                                                              <div className={"flex  w-full  p-1  "}>
                                                                <div className="">
                                                                  <Card small color={m.color} status={m.status} title={m.title} link={this.props.url + "/m/" + m.id} />
                                                                </div>

                                                              </div>

                                                              :
                                                              <div className={"flex  w-full  "}>
                                                                <div className="p-1">
                                                                  {

                                                                    (() => {
                                                                          const f = filterFeaturesOnMilestone(features, m.id)
                                                                          return <Card bottomStatus={f.length ? closedFeatures(f).length + "/" + f.length : undefined} color={m.color} status={m.status} title={m.title} link={this.props.url + "/m/" + m.id} />
                                                                        }
                                                                    )()
                                                                  }

                                                                </div>

                                                                {ww.map((w) => {

                                                                  var ss = getSubWorkflowByWorkflow(subWorkflows, w.id)
                                                                  if ( !this.props.showClosed ) {
                                                                    ss = filterOutClosedSubWorkflows(ss)
                                                                  }

                                                                  return [
                                                                    <div className="flex flex-row pl-1 pr-1" key={w.id}>
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
                                                                                  <div className="flex flex-col fm-paren "
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

                                                                                                      <Card color={f.color} status={f.status} title={f.title} link={this.props.url + "/f/" + f.id} bottomLink={index === ff.length - 1 && !viewOnly ? () => this.setState({ showCreateFeatureModal: true, createFeatureModalMilestoneId: m.id, createFeatureModalSubWorkflowId: sw.id }) : undefined} />
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
                                                        }
                                                      </div>
                                                    </div>

                                                )}
                                              </Draggable>

                                            ]
                                          }
                                      )
                                }
                                {providedDroppable.placeholder}
                                <div className="flex   p-2  text-xs ">

                                  {!viewOnly && <NewCard>
                                    <Button title="Add release" icon="add" noborder handleOnClick={() => this.setState({ showCreateMilestoneModal: true })} />
                                  </NewCard>}

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
