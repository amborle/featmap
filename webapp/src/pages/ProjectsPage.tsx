import { Button, CardLayout } from '../components/elements'
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { AppState } from '../store'
import { application, getWorkspaceByName, getMembership, getSubscription } from '../store/application/selectors';
import { connect } from 'react-redux'
import { IApplication } from '../store/application/types';
import { projects } from '../store/projects/selectors';
import { IProject } from '../store/projects/types';
import { Link } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal'
import TimeAgo from 'react-timeago'
import { isEditor, subIsInactive } from '../core/misc';

const mapStateToProps = (state: AppState) => ({
    application: application(state),
    projects: projects(state)
})

const mapDispatchToProps = {}

interface PropsFromState {
    application: IApplication
    projects: IProject[]
}
interface RouterProps extends RouteComponentProps<{
    workspaceName: string
}> { }
interface PropsFromDispatch {

}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    show: boolean
    showAddProjectModal: boolean
}

class WorkspacePage extends Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            show: false,
            showAddProjectModal: false
        }
    }

    openProjectModal = () => {
        this.setState(state => ({
            showAddProjectModal: true

        }))
    }

    closeProjectModal = () => {
        this.setState(state => ({
            showAddProjectModal: false

        }))
    }

    render() {
        const { workspaceName } = this.props.match.params

        const ws = getWorkspaceByName(this.props.application, this.props.match.params.workspaceName)!
        const member = getMembership(this.props.application, ws.id)
        const s = getSubscription(this.props.application, ws.id)

        const viewOnly = !isEditor(member.level) || subIsInactive(s)

        return (
            <div>

                {this.state.showAddProjectModal ?
                    <CreateProjectModal workspaceName={workspaceName} close={this.closeProjectModal} />
                    : null
                }

                <div className="  ">
                    <div className="p-2 flex flex-row mb-2 items-center">
                        <div ><h3>Projects</h3></div>
                        {!viewOnly && <div className="ml-2"> <Button title="New project" primary icon="add" handleOnClick={() => this.openProjectModal()} />
                        </div>}

                    </div>
                    <div>

                    </div>
                    <CardLayout>
                        <div >
                            {(this.props.projects.length > 0) ?

                                <div className="flex flex-col  max-w-lg  " >
                                    <div className="p-2  ">
                                        {this.props.projects.length}  project(s)

                                    </div>

                                    <div >
                                        {
                                            this.props.projects.map(x =>
                                                (<div className=" p-2" key={x.id}>
                                                    <div className="mb-1">
                                                        <b><Link className="" to={this.props.location.pathname + "/projects/" + x.id}>{x.title} </Link></b>
                                                    </div>
                                                    <div className="text-xs">Created <TimeAgo date={x.createdAt} /> by {x.createdByName}</div>
                                                </div>)
                                            )
                                        }
                                    </div>
                                </div>
                                : "No projects"
                            }
                        </div>
                    </CardLayout>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkspacePage)
