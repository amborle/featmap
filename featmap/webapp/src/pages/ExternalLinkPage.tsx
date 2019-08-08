import React, { Component } from 'react';
import { loadMilestones } from '../store/milestones/actions';
import { loadWorkflows } from '../store/workflows/actions';
import { loadSubWorkflows } from '../store/subworkflows/actions';
import { loadFeatures } from '../store/features/actions';
import { loadProjects } from '../store/projects/actions';
import { RouteComponentProps } from 'react-router'
import { Route, Switch, Link } from 'react-router-dom'
import { AppState } from '../store'
import { connect } from 'react-redux'
import { IApplication } from '../store/application/types'
import { API_GET_EXTERNAL_LINK, API_GET_PROJECT_RESP } from '../api';
import { IProject } from '../store/projects/types';
import { IMilestone } from '../store/milestones/types';
import { IWorkflow } from '../store/workflows/types';
import { ISubWorkflow } from '../store/subworkflows/types';
import { IFeature } from '../store/features/types';
import { features } from '../store/features/selectors';
import Board from '../components/Board';
import { filterWorkflowsOnProject, workflows } from '../store/workflows/selectors';
import { filterMilestonesOnProject, milestones } from '../store/milestones/selectors';
import { projects, getProjectById } from '../store/projects/selectors';
import { subWorkflows } from '../store/subworkflows/selectors';
import { Button } from '../components/elements';
import ExternalEntityDetailsPage from './ExternalEntityDetailsPage';
import queryString from 'query-string'


const mapDispatchToProps = {
    loadProjects,
    loadMilestones,
    loadWorkflows,
    loadSubWorkflows,
    loadFeatures
};

const mapStateToProps = (state: AppState) => ({
    application: state.application.application,
    features: features(state),
    projects: projects(state),
    milestones: milestones(state),
    workflows: workflows(state),
    subWorkflows: subWorkflows(state)
});

interface PropsFromState {
    application: IApplication
    features: IFeature[]
    projects: IProject[]
    milestones: IMilestone[]
    workflows: IWorkflow[]
    subWorkflows: ISubWorkflow[]
}
interface RouterProps extends RouteComponentProps<{
    key: string
}> { }
interface PropsFromDispatch {
    loadProjects: typeof loadProjects
    loadMilestones: typeof loadMilestones
    loadWorkflows: typeof loadWorkflows
    loadSubWorkflows: typeof loadSubWorkflows
    loadFeatures: typeof loadFeatures
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    loading: boolean
    projectId?: string
    showClosedMilestones: boolean
    demo: boolean
}

class ExternalLinkPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            projectId: undefined,
            showClosedMilestones: false,
            demo: false
        }
    }

    componentDidMount() {

        const values = queryString.parse(this.props.location.search);
        const demo = values.demo as string;
        if (demo === "1") this.setState({ demo: true });

        API_GET_EXTERNAL_LINK(this.props.match.params.key)
            .then(response => {
                if (!response.ok) {
                    this.setState({loading: false})
                } else {
                    response.json().then((data: API_GET_PROJECT_RESP) => {
                        this.props.loadProjects([data.project]);
                        this.props.loadFeatures(data.features);
                        this.props.loadMilestones(data.milestones);
                        this.props.loadWorkflows(data.workflows);
                        this.props.loadSubWorkflows(data.subWorkflows);
                        this.setState({projectId: data.project.id});
                        this.setState({loading: false})
                    })
                }

            })
    }

    render() {
        if (this.state.loading) {
            return (<div className="p-2">Loading data...</div>)
        } else if (this.state.projectId) {

            const project = getProjectById(this.props.projects, this.state.projectId)!;


            return (
                <div>
                    <header className="text-black">
                        <div className="flex items-center p-1 bg-gray-200">
                            <div className="flex text-lg mt-2 mb-2   m-1 w-24 ">
                                <b><Link to="/">Featmap</Link></b>
                            </div>
                        </div>
                    </header>
                    <div className="">
                        <div className="flex flex-row p-2 ">
                            <div className="flex flex-grow m-1 text-xl items-center">
                                <div className="flex"><span className="font-semibold">{project.title}  </span></div>
                                <div className="flex ml-2"><span className="font-semibold p-1 bg-gray-200 text-xs "> VIEW ONLY  </span></div>
                                {this.state.demo && <div className="flex ml-2"><span className="font-semibold p-1 bg-pink-400 text-xs text-white "> DEMO MODE  </span></div>}
                            </div>
                            <div className="flex items-center">
                                <div className=" flex items-center  text-sm">
                                    <div>
                                        {this.state.showClosedMilestones ?
                                            <Button iconColor="text-green-500-500" icon="toggle_on" title="Show closed milestones" handleOnClick={() => this.setState({ showClosedMilestones: false })} />
                                            :
                                            <Button icon="toggle_off " title="Show closed milestones" handleOnClick={() => this.setState({ showClosedMilestones: true })} />
                                        }
                                    </div>
                                </div>
                                <div className="ml-4"><Link to={this.props.match.url + "/p/" + this.state.projectId}><i className="material-icons text-gray-600">settings</i></Link></div>
                            </div>
                        </div>
                        <div className="mt-2">

                            <Board
                                showClosedMilstones={this.state.showClosedMilestones}
                                viewOnly={true}
                                url={this.props.match.url}
                                features={this.props.features}
                                workflows={filterWorkflowsOnProject(this.props.workflows, project.id)}
                                subWorkflows={this.props.subWorkflows}
                                milestones={filterMilestonesOnProject(this.props.milestones, project.id)}
                                projectId={project.id}
                                workspaceId={project.workspaceId}
                                demo={this.state.demo}
                            />
                        </div>
                    </div>

                    <Switch>
                        <Route exact path="/" component={() => null} />
                        <Route exact path={this.props.match.path + "/m/:milestoneId"} render={(props) => <ExternalEntityDetailsPage {...props} demo={this.state.demo} />} />
                        <Route exact path={this.props.match.path + "/sw/:subWorkflowId"} render={(props) => <ExternalEntityDetailsPage {...props} demo={this.state.demo} />} />
                        <Route exact path={this.props.match.path + "/f/:featureId"} render={(props) => <ExternalEntityDetailsPage {...props} demo={this.state.demo} />} />
                        <Route exact path={this.props.match.path + "/w/:workflowId"} render={(props) => <ExternalEntityDetailsPage {...props} demo={this.state.demo} />} />
                        <Route exact path={this.props.match.path + "/p/:projectId2"} render={(props) => <ExternalEntityDetailsPage {...props} demo={this.state.demo} />} />

                    </Switch>
                </div>
            )
        } else {
            return (<div className="p-2">Project not found. </div>)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExternalLinkPage); 