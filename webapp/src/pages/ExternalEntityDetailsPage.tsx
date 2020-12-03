import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { RouteComponentProps } from 'react-router'
import { IApplication } from '../store/application/types';
import { milestones, getMilestone } from '../store/milestones/selectors';
import { features, getFeature } from '../store/features/selectors';
import { workflows, getWorkflow } from '../store/workflows/selectors';
import { IMilestone } from '../store/milestones/types';
import EntityDetailsModal from '../components/EntityDetailsModal';
import { getSubWorkflow, subWorkflows } from '../store/subworkflows/selectors';
import { ISubWorkflow } from '../store/subworkflows/types';
import { IWorkflow } from '../store/workflows/types';
import { IFeature } from '../store/features/types';
import { projects, getProjectById } from '../store/projects/selectors';
import { IProject } from '../store/projects/types';
import { application } from '../store/application/selectors';
import { filterFeatureCommentsOnFeature, featureComments } from '../store/featurecomments/selectors';
import { IFeatureComment } from '../store/featurecomments/types';

const mapStateToProps = (state: AppState) => ({
  application: application(state),
  milestones: milestones(state),
  subWorkflows: subWorkflows(state),
  workflows: workflows(state),
  features: features(state),
  featureComments: featureComments(state),
  projects: projects(state)
})

const mapDispatchToProps = {

}

interface PropsFromState {
  application: IApplication
  milestones: IMilestone[]
  subWorkflows: ISubWorkflow[]
  workflows: IWorkflow[]
  features: IFeature[]
  featureComments: IFeatureComment[]
  projects: IProject[]
}

interface PropsFromDispatch {
}

interface RouterProps extends RouteComponentProps<{
  projectId2: string
  milestoneId: string
  subWorkflowId: string
  workflowId: string
  featureId: string
  key: string
}> { }


interface SelfProps {
  demo: boolean
}

type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {

}

interface formValues {
  title: string
}

class ExternalEntityDetailsPage extends Component<Props, State> {

  close = () => {
    this.props.history.push("/link/" + this.props.match.params.key + (this.props.demo ? "?demo=1" : ""))
  };

  render() {
    const viewOnly = !this.props.demo

    if (this.props.match.params.milestoneId) {
      const ms = getMilestone(this.props.milestones, this.props.match.params.milestoneId)
      return (
        <EntityDetailsModal demo={this.props.demo} viewOnly={viewOnly} entity={ms} url={this.props.match.url} close={this.close} comments={[]} />
      )
    }

    else if (this.props.match.params.subWorkflowId) {
      const ms = getSubWorkflow(this.props.subWorkflows, this.props.match.params.subWorkflowId)
      return (
        <EntityDetailsModal demo={this.props.demo} viewOnly={viewOnly} entity={ms} url={this.props.match.url} close={this.close} comments={[]} />
      )
    }

    else if (this.props.match.params.workflowId) {
      const ms = getWorkflow(this.props.workflows, this.props.match.params.workflowId)
      return (
        <EntityDetailsModal demo={this.props.demo} viewOnly={viewOnly} entity={ms} url={this.props.match.url} close={this.close} comments={[]} />
      )
    }

    else if (this.props.match.params.featureId) {
      const p = getFeature(this.props.features, this.props.match.params.featureId)
      const c = filterFeatureCommentsOnFeature(this.props.featureComments, this.props.match.params.featureId)

      return (
        <EntityDetailsModal demo={this.props.demo} viewOnly={viewOnly} entity={p} url={this.props.match.url} close={this.close} comments={c} />
      )
    }

    else if (this.props.match.params.projectId2) {
      const p = getProjectById(this.props.projects, this.props.match.params.projectId2)!
      return (
        <EntityDetailsModal demo={this.props.demo} viewOnly={viewOnly} entity={p} url={this.props.match.url} close={this.close} comments={[]} />
      )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExternalEntityDetailsPage)
