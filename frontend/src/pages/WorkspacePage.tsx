import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { AppState } from '../store'
import { getWorkspaceByName, application } from '../store/application/selectors';
import { connect } from 'react-redux'
import NotFound from './NotFound';
import ProjectPage from './ProjectPage';
import Header from '../components/Header';
import { IApplication } from '../store/application/types';
import { loadProjects } from '../store/projects/actions';
import { projects } from '../store/projects/selectors';
import { IProject } from '../store/projects/types';
import { Route, Switch, Redirect } from 'react-router-dom'
import ProjectsPage from './ProjectsPage';
import { API_GET_PROJECTS } from '../api'
import WorkspaceSettingsPage from './WorkspaceSettingsPage';

const mapStateToProps = (state: AppState) => ({
    application: application(state),
    projects: projects(state)
})

const mapDispatchToProps = {
    loadProjects: loadProjects
}

interface PropsFromState {
    application: IApplication
    projects: IProject[]
}
interface RouterProps extends RouteComponentProps<{
    workspaceName: string
}> { }
interface PropsFromDispatch {
    //loadProjectsRequest: typeof loadProjectsRequest
    loadProjects: typeof loadProjects
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    loading: boolean
    notFound: boolean
}

class WorkspacePage extends Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            loading: true,
            notFound: false
        }
    }

    componentDidMount() {
        const { workspaceName } = this.props.match.params
        const ws = getWorkspaceByName(this.props.application, workspaceName)

        if (!ws) this.setState({ notFound: true })

        if (ws) {
            API_GET_PROJECTS(ws.id)
                .then(response => {
                    if (response.ok) {
                        response.json().then((data: IProject[]) => {
                            this.props.loadProjects(data)
                            this.setState({ loading: false })
                        })
                    }
                }
                )

        }
    }

    render() {
        const { workspaceName } = this.props.match.params

        return (
            this.state.notFound ?
                <div><Redirect to="/" /></div>
                :
                this.state.loading ?
                    <div className="p-2">Loading data...</div>
                    :
                    (
                        <div>
                            <div>
                                <Header account={this.props.application.account!} workspaceName={workspaceName} />

                                <Switch>
                                    <Route exact strict path={this.props.match.path} component={ProjectsPage} />
                                    <Route exact strict path={this.props.match.path + "/settings"} component={WorkspaceSettingsPage} />
                                    <Route strict path={this.props.match.path + "/projects/:projectId"} component={ProjectPage} />
                                    <Route path={this.props.match.path} component={NotFound} />
                                </Switch>
                            </div>
                        </div>
                    )
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkspacePage)