import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { Formik, FormikActions, FormikProps, Form } from 'formik';
import { API_ACCEPT_INVITE, API_GET_INVITE } from '../api'
import { Link } from 'react-router-dom'
import { Button } from '../components/elements';
import { memberLevelToTitle } from "../core/misc";
import { IInvite } from '../store/application/types';


interface PropsFromState { }
interface RouterProps extends RouteComponentProps<{
    code: string
}> { }
interface PropsFromDispatch {
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    invite?: IInvite
    notFound: boolean
    success: boolean
}

class AcceptInvitePage extends Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            invite: undefined,
            notFound: false,
            success: false,
        }
    }

    componentDidMount() {

        API_GET_INVITE(this.props.match.params.code)
            .then(response => {
                if (response.ok) {
                    response.json().then((data: IInvite) => {
                        this.setState({ invite: data })

                    })
                } else {
                    this.setState({ notFound: true })
                }
            })

    }

    render() {

        if (this.state.notFound) {
            return <div className="p-2"> Invitation not found. Back to <Link className="link" to="/">Featmap</Link>. </div>
        }

        if (this.state.success) {
            return <div className="p-2"> You are now a member of <b> {this.state.invite!.workspaceName}</b>! Back to <Link className="link" to="/">Featmap</Link>. </div>
        }

        if (this.state.invite) {

            return (

                <div className="flex p-2  w-full  justify-center items-center flex-col ">
                    <div className="flex  p-3  max-w-xl w-full   items-center  flex-col  ">
                        <div className="flex  p-2 flex-col items-baseline">
                            <div className="p-1 "><h1 className={"text-3xl font-medium"}>Invitation to join workspace</h1></div>
                        </div>
                        <p>
                            The workspace name is <b>{this.state.invite!.workspaceName}</b> and you will join as <b>{memberLevelToTitle(this.state.invite!.level)}</b>.
                        </p>

                        <div>
                            <Formik
                                initialValues={{}}

                                onSubmit={(values: {}, actions: FormikActions<{}>) => {
                                    actions.setStatus("")
                                    API_ACCEPT_INVITE(this.props.match.params.code)
                                        .then(response => {
                                            if (response.ok) {
                                                this.setState({ success: true })
                                            } else {
                                                response.json().then((data: { message: string }) => {
                                                    actions.setStatus(data.message)
                                                })
                                            }
                                        })

                                    actions.setSubmitting(false)
                                }}
                                render={(formikBag: FormikProps<{}>) => (
                                    <Form>
                                        <div className="p-2 font-bold  text-red">{formikBag.status}</div>
                                        <div className="flex  w-full text-lg justify-center ">
                                            <div><Button title="Accept invite" primary submit  /></div>
                                        </div>
                                    </Form>
                                )}
                            />
                        </div>
                        <div className="flex  p-2 flex-col ">
                            <div className="p-1 text-center">Not a member? <Link target="_blank" className="link" to="/account/signup">Create an account</Link></div>
                        </div>
                    </div>
                </div>
            )

        }
        else {
            return (<div>Loading</div>)
        }

    }

}


export default AcceptInvitePage