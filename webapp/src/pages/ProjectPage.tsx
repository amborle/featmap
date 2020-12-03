import React, { Component } from 'react';
import Board from '../components/Board';
import EntityDetailsPage from './EntityDetailsPage';
import { application, getWorkspaceByName, getMembership, getSubscription } from '../store/application/selectors';
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
import { features, filterFeaturesOnMilestoneAndSubWorkflow } from '../store/features/selectors';
import { filterWorkflowsOnProject } from '../store/workflows/selectors';
import { subWorkflows, getSubWorkflowByWorkflow } from '../store/subworkflows/selectors';
import { ISubWorkflow } from '../store/subworkflows/types';
import { workflows } from '../store/workflows/selectors';
import { IWorkflow } from '../store/workflows/types';
import { loadSubWorkflows } from '../store/subworkflows/actions';
import { loadFeatures } from '../store/features/actions';
import { loadPersonas } from '../store/personas/actions';
import { loadWorkflowPersonas } from '../store/workflowpersonas/actions';
import { loadFeatureComments } from '../store/featurecomments/actions';
import { IFeature } from '../store/features/types';
import { isEditor, subIsInactive, subIsTrial, subIsBasicOrAbove } from '../core/misc';
import { Button } from '../components/elements';
import queryString from 'query-string'
import { featureComments, filterFeatureCommentsOnProject } from '../store/featurecomments/selectors';
import { IFeatureComment } from '../store/featurecomments/types';
import ContextMenu from '../components/ContextMenu';
import { workflowPersonas, filterWorkflowPersonasOnProject } from '../store/workflowpersonas/selectors';
import { personas, filterPersonasOnProject } from '../store/personas/selectors';
import { IPersona } from '../store/personas/types';
import { IWorkflowPersona } from '../store/workflowpersonas/types';

const mapStateToProps = (state: AppState) => ({
    application: application(state),
    projects: projects(state),
    milestones: milestones(state),
    subWorkflows: subWorkflows(state),
    workflows: workflows(state),
    features: features(state),
    featureComments: featureComments(state),
    personas: personas(state),
    workflowPersonas: workflowPersonas(state)
})

const mapDispatchToProps = {
    loadMilestones,
    loadWorkflows,
    loadSubWorkflows,
    loadFeatures,
    loadFeatureComments,
    loadPersonas,
    loadWorkflowPersonas
}

interface PropsFromState {
    application: IApplication
    projects: IProject[]
    milestones: IMilestone[]
    subWorkflows: ISubWorkflow[]
    workflows: IWorkflow[]
    features: IFeature[]
    featureComments: IFeatureComment[]
    personas: IPersona[]
    workflowPersonas: IWorkflowPersona[]
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
    loadFeatureComments: typeof loadFeatureComments
    loadPersonas: typeof loadPersonas
    loadWorkflowPersonas: typeof loadWorkflowPersonas
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    projectFound: boolean
    loading: boolean
    showClosedMilstones: boolean
    copySuccess: boolean
    demo: boolean
    showPersonas: boolean
}

class ProjectPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            projectFound: false,
            loading: true,
            showClosedMilstones: false,
            copySuccess: false,
            demo: false,
            showPersonas: false
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
                            this.props.loadFeatureComments(data.featureComments)
                            this.props.loadPersonas(data.personas)
                            this.props.loadWorkflowPersonas(data.workflowPersonas)
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

    download = (filename: string, text: string) => {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    projectCSV = (): string => {

        var csv = `sep=,\n`
        csv = csv + `release_title, goal_title, activity_title, feature_title, feature_description, feature_status, feature_color,feature_annotations,feature_size \n`

        this.props.milestones.forEach(m =>
            this.props.workflows.forEach(w => {
                getSubWorkflowByWorkflow(this.props.subWorkflows, w.id).forEach(sw => {
                    filterFeaturesOnMilestoneAndSubWorkflow(this.props.features, m.id, sw.id).forEach(f => {
                        csv = csv + `"${m.title.replace(/"/g, '""',)}","${w.title.replace(/"/g, '""',)}","${sw.title.replace(/"/g, '""',)}","${f.title.replace(/"/g, '""',)}","${f.description.replace(/"/g, '""',)}","${f.status.replace(/"/g, '""',)}","${f.color.replace(/"/g, '""',)}","${f.annotations.replace(/"/g, '""',)}","${f.estimate.toString()}"\n`
                    })
                }
                )
            }
            )
        )
        return csv
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
        const s = getSubscription(this.props.application, ws.id)

        const viewOnly = !isEditor(member.level) || subIsInactive(s)
        const showPrivateLink = !subIsInactive(s) && (subIsTrial(s) || subIsBasicOrAbove(s)) && ws.allowExternalSharing

        return (
            proj ?
                this.state.loading ?
                    <div className="p-2">Loading data...</div>
                    :
                    <div className="overflow-x-auto">
                        <div className="flex flex-row p-2 ">
                            <div className="flex flex-grow m-1 text-xl items-center">
                                <div className="flex"><span className="font-semibold">{proj.title}  </span></div>
                                <ContextMenu icon="more_horiz">
                                    <div className="rounded bg-white shadow-md  absolute mt-8 top-0 right-0 min-w-full text-xs" >
                                        <ul className="list-reset">
                                            <li><Button noborder title="Export CSV" handleOnClick={() => this.download("storymap.csv", this.projectCSV())} /></li>
                                        </ul>
                                    </div>
                                </ContextMenu>
                                {viewOnly && <div className="flex ml-2"><span className="font-semibold p-1 bg-gray-200 text-xs "> VIEW ONLY  </span></div>}
                            </div>
                            <div className="flex items-center">
                                <div className=" flex items-center  text-sm">


                                    {showPrivateLink &&
                                        <div >

                                            <div className="flex items-center flex-grow">
                                                <div className="flex flex-grow mr-1 " ><Link target="_blank" className="link" to={"/link/" + proj.externalLink}>Share link </Link></div>
                                                <div>
                                                    {document.queryCommandSupported('copy') && <button onClick={() => this.copyToClipboard(process.env.REACT_APP_BASE_URL + "/link/" + proj.externalLink)}><i style={{ fontSize: "16px" }} className="material-icons text-gray-800">file_copy</i></button>}
                                                </div>
                                                <div >
                                                    <i style={{ fontSize: "16px" }} className={"material-icons  text-green-500" + (!this.state.copySuccess ? " invisible" : "")}>check_circle</i>
                                                </div>
                                            </div>

                                        </div>
                                    }

                                    <div >
                                        <Button title="Personas" icon="person_outline" noborder handleOnClick={() => this.setState({ showPersonas: true })} />
                                    </div>

                                    <div className="">
                                        {this.state.showClosedMilstones ?
                                            <Button iconColor="text-green-500" noborder icon="toggle_on" title="Show closed" handleOnClick={() => this.setState({ showClosedMilstones: false })} />
                                            :
                                            <Button icon="toggle_off " noborder title="Show closed" handleOnClick={() => this.setState({ showClosedMilstones: true })} />
                                        }
                                    </div>

                                </div>
                                <div className="ml-4"><Link to={this.props.match.url + "/p/" + this.props.match.params.projectId}><i className="material-icons text-gray-600">settings</i></Link></div>
                            </div>
                        </div>

                        <Board
                            showClosed={this.state.showClosedMilstones}
                            viewOnly={viewOnly}
                            url={this.props.match.url}
                            features={this.props.features}
                            workflows={filterWorkflowsOnProject(this.props.workflows, projectId)}
                            subWorkflows={this.props.subWorkflows}
                            milestones={filterMilestonesOnProject(this.props.milestones, projectId)}
                            projectId={projectId}
                            workspaceId={ws.id}
                            demo={this.state.demo}
                            comments={filterFeatureCommentsOnProject(this.props.featureComments, projectId)}
                            personas={filterPersonasOnProject(this.props.personas, projectId)}
                            workflowPersonas={filterWorkflowPersonasOnProject(this.props.workflowPersonas, projectId)}

                            showPersonas={this.state.showPersonas}
                            closePersonas={() => this.setState({ showPersonas: false })}
                            openPersonas={() => this.setState({ showPersonas: true })}
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