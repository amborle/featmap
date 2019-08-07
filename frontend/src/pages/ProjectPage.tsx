import React, { Component } from 'react';
import Board from '../components/Board';
import EntityDetailsPage from './EntityDetailsPage';
import { application, getWorkspaceByName, getMembership } from '../store/application/selectors';
import { projects, getProjectById } from '../store/projects/selectors';
import { RouteComponentProps } from 'react-router'
import { Route, Switch, Link } from 'react-router-dom'
import { IProject } from '../store/projects/types';
import { loadMilestones } from '../store/milestones/actions';
import { loadWorkflows } from '../store/workflows/actions';
import { milestones, filterMilestonesOnProject } from '../store/milestones/selectors';
import { AppState } from '../store'
import { connect } from 'react-redux'
import { API_GET_PROJECT, API_GET_PROJECT_RESP } from '../api';
import { IApplication } from '../store/application/types';
import { IMilestone } from '../store/milestones/types';
import { features } from '../store/features/selectors';
import { filterWorkflowsOnProject } from '../store/workflows/selectors';
import { subWorkflows } from '../store/subworkflows/selectors';
import { ISubWorkflow } from '../store/subworkflows/types';
import { workflows } from '../store/workflows/selectors';
import { IWorkflow } from '../store/workflows/types';
import { loadSubWorkflows } from '../store/subworkflows/actions';
import { loadFeatures } from '../store/features/actions';
import { IFeature } from '../store/features/types';
import { isEditor } from '../core/misc';
import { Button } from '../components/elements';
import queryString from 'query-string'

const mapStateToProps = (state: AppState) => ({
    application: application(state),
    projects: projects(state),
    milestones: milestones(state),
    subWorkflows: subWorkflows(state),
    workflows: workflows(state),
    features: features(state)
})

const mapDispatchToProps = {
    loadMilestones,
    loadWorkflows,
    loadSubWorkflows,
    loadFeatures
}

interface PropsFromState {
    application: IApplication
    projects: IProject[]
    milestones: IMilestone[]
    subWorkflows: ISubWorkflow[]
    workflows: IWorkflow[]
    features: IFeature[]
}
interface RouterProps extends RouteComponentProps<{
    workspaceName: string
    projectId: string
}> { }
interface PropsFromDispatch {
    loadMilestones: typeof loadMilestones
    loadWorkflows: typeof loadWorkflows
    loadSubWorkflows: typeof loadSubWorkflows
    loadFeatures: typeof loadFeatures
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    projectFound: boolean
    loading: boolean
    showClosedMilstones: boolean
    copySuccess: boolean
    demo: boolean
}

class ProjectPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            projectFound: false,
            loading: true,
            showClosedMilstones: false,
            copySuccess: false,
            demo: false
        }
    }

    componentDidMount() {
        const { projectId, workspaceName } = this.props.match.params
        const p = getProjectById(this.props.projects, projectId)
        const ws = getWorkspaceByName(this.props.application, workspaceName)!

        if (p) {

            API_GET_PROJECT(ws.id, p.id)
                .then(response => {
                    if (response.ok) {
                        response.json().then((data: API_GET_PROJECT_RESP) => {
                            this.props.loadMilestones(data.milestones)
                            this.props.loadWorkflows(data.workflows)
                            this.props.loadSubWorkflows(data.subWorkflows)
                            this.props.loadFeatures(data.features)
                            this.setState({ loading: false })
                        })
                    }

                })
        }
        if (p) this.setState({ projectFound: true })
    }

    componentDidUpdate() {
        const { projectId } = this.props.match.params
        const proj = getProjectById(this.props.projects, projectId)!

        if (!proj) {
            this.props.history.push("/" + this.props.match.params.workspaceName)
        }

        const values = queryString.parse(this.props.location.search)
        const demo = values.demo as string
        if (demo === "1") this.setState({ demo: true })

    }


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

    urlRef = React.createRef<HTMLInputElement>()

    render() {
        const { projectId, workspaceName } = this.props.match.params
        const ws = getWorkspaceByName(this.props.application, workspaceName)!
        const proj = getProjectById(this.props.projects, projectId)!
        const member = getMembership(this.props.application, ws.id)

        const viewOnly = !isEditor(member.level)

        return (
            proj ?
                this.state.loading ?
                    <div className="p-2">Loading data...</div>
                    :
                    <div className="overflow-x-auto">
                        <div className="flex flex-row p-2 ">
                            <div className="flex flex-grow m-1 text-xl items-center">
                                <div className="flex"><span className="font-semibold">{proj.title}  </span></div>
                                {viewOnly && <div className="flex ml-2"><span className="font-semibold p-1 bg-gray-200 text-xs "> VIEW ONLY  </span></div>}
                            </div>
                            <div className="flex items-center">
                                <div className=" flex items-center  text-sm">

                                    {ws.allowExternalSharing &&
                                        <div >
                                            <div className="flex items-center flex-grow">
                                                <div className="flex flex-grow mr-1 " ><Link target="_blank" className="link" to={"/link/" + proj.externalLink}>External link (view only) </Link></div>
                                                <div>
                                                    {document.queryCommandSupported('copy') && <button onClick={() => this.copyToClipboard(process.env.REACT_APP_BASE_URL + "/link/" + proj.externalLink)}><i style={{ fontSize: "16px" }} className="material-icons text-gray-800">file_copy</i></button>}
                                                </div>
                                                <div >
                                                    <i style={{ fontSize: "16px" }} className={"material-icons  text-green-500" + (!this.state.copySuccess ? " invisible" : "")}>check_circle</i>
                                                </div>
                                            </div>

                                        </div>
                                    }
                                    <div className="ml-2">
                                        {this.state.showClosedMilstones ?
                                            <Button iconColor="text-green-500" icon="toggle_on" title="Show closed milestones" handleOnClick={() => this.setState({ showClosedMilstones: false })} />
                                            :
                                            <Button icon="toggle_off " title="Show closed milestones" handleOnClick={() => this.setState({ showClosedMilstones: true })} />
                                        }
                                    </div>
                                </div>
                                <div className="ml-4"><Link to={this.props.match.url + "/p/" + this.props.match.params.projectId}><i className="material-icons text-gray-600">settings</i></Link></div>
                            </div>
                        </div>

                        <Board
                            showClosedMilstones={this.state.showClosedMilstones}
                            viewOnly={viewOnly}
                            url={this.props.match.url}
                            features={this.props.features}
                            workflows={filterWorkflowsOnProject(this.props.workflows, projectId)}
                            subWorkflows={this.props.subWorkflows}
                            milestones={filterMilestonesOnProject(this.props.milestones, projectId)}
                            projectId={projectId}
                            workspaceId={ws.id}
                            demo={this.state.demo}
                        />


                        <Switch>
                            <Route exact path="/" component={() => null} />
                            <Route exact path={this.props.match.path + "/m/:milestoneId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/sw/:subWorkflowId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/f/:featureId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/w/:workflowId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/p/:projectId2"} component={EntityDetailsPage} />

                        </Switch>
                    </div>
                : <div>Project not found</div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage)