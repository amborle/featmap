import React, { Component, Dispatch } from 'react';
import { Button, CardLayout } from '../components/elements'
import Header from '../components/Header';
import { RouteComponentProps } from 'react-router'
import { AppState, AllActions } from '../store'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Formik, FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { API_CHANGE_EMAIL_REQ, API_CHANGE_EMAIL, API_RESEND_EMAIL, API_CHANGE_NAME, API_CHANGE_NAME_REQ, API_DELETE_ACCOUNT } from '../api'
import { newMessage } from '../store/application/actions';


const mapDispatchToProps = (dispatch: Dispatch<AllActions>) => ({
    newMessage: newMessage(dispatch)
})

const mapStateToProps = (state: AppState) => ({
    state: state
})

interface PropsFromState {
    state: AppState
}
interface RouterProps extends RouteComponentProps<{
}> { }
interface PropsFromDispatch {
    newMessage: ReturnType<typeof newMessage>
}
interface OwnProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & OwnProps

interface State {
    reallySureWarning: boolean
}

class WorkspacesPage extends Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { reallySureWarning: false }
    }


    render() {
        return (
            <div>
                <Header account={this.props.state.application.application.account!}/>
                <div >
                    <h3 className="p-2">Account settings</h3>

                    {this.props.state.application.application.account!.emailConfirmationPending &&
                        <CardLayout title="">
                            <span className="text-red-500 text-xl">⬤</span> <em>Email adress verfication missing</em>
                            <hr/>
                            <p> A mail has been sent to  <i>{this.props.state.application.application.account!.emailConfirmationSentTo}</i>, but we have not yet received verfication. </p>
                            <hr/>

                            <Formik
                                initialValues={{}}
                                initialStatus=""

                                onSubmit={(values: {}, actions: FormikActions<{}>) => {
                                    actions.setStatus("")
                                    API_RESEND_EMAIL()
                                        .then(response => {
                                            if (response.ok) {
                                                actions.setStatus("Mail sent.")
                                            } else {
                                                actions.setStatus("Something went wrong.")
                                            }
                                        })


                                    actions.setSubmitting(false)
                                }}
                                render={(formikBag: FormikProps<{}>) => (
                                    <Form>
                                        <Field
                                            name="email"
                                            render={({ field, form }: FieldProps<{}>) => (
                                                <div>
                                                    <div className="flex  flex-row items-baseline">
                                                        <div className=" w-full text-xs"><Button submit secondary title="Resend email" /></div>
                                                    </div>
                                                    <div className="p-1 text-xs font-bold">{formikBag.status}</div>
                                                </div>
                                            )}
                                        />
                                    </Form>
                                )}
                            />
                        </CardLayout>
                    }


                    <CardLayout title="Email adress">
                        <p>Your email adress is {this.props.state.application.application.account!.email}</p>

                        {this.props.state.application.application.account!.emailConfirmed ?
                            <p><span className="text-green-500 text-xl ">⬤</span> The email adress is verified.. </p>
                            :
                            <p><span className="text-red-500 text-xl">⬤</span> <em>The email adress is not verified.</em> </p>
                        }

                        <hr/>
                        <div className="flex flex-row items-baseline">
                            <Formik
                                initialValues={{ email: '' }}
                                initialStatus=""

                                validationSchema={Yup.object().shape({
                                    email: Yup.string()
                                        .email('Invalid email adress.')
                                        .required('Required.')
                                })}

                                onSubmit={(values: API_CHANGE_EMAIL_REQ, actions: FormikActions<API_CHANGE_EMAIL_REQ>) => {
                                    actions.setStatus("")
                                    API_CHANGE_EMAIL(values)
                                        .then(response => {
                                            if (response.ok) {
                                                actions.setStatus("An email has been sent to your new email with instructions.")
                                            } else {
                                                actions.setStatus("Something went wrong.")
                                            }
                                        })


                                    actions.setSubmitting(false)
                                }}
                                render={(formikBag: FormikProps<API_CHANGE_EMAIL_REQ>) => (
                                    <Form>
                                        <Field
                                            name="email"
                                            render={({ field, form }: FieldProps<API_CHANGE_EMAIL_REQ>) => (
                                                <div className=" ">
                                                    <div className="flex  flex-row items-baseline">

                                                        <div className="flex flex-col w-full mr-1">
                                                            <div><input type="text" {...field} placeholder="email" id="email" className="rounded p-1 border  	"/></div>
                                                        </div>
                                                        <span className="text-xs"><Button submit title="Change email" secondary small/></span>

                                                    </div>
                                                    <div className="p-1 text-red-500 text-xs font-bold">{form.touched.email && form.errors.email}</div>

                                                    <div className="p-1 text-xs font-bold">{formikBag.status}</div>
                                                </div>
                                            )}
                                        />
                                    </Form>
                                )}
                            />
                        </div>
                    </CardLayout>

                    <CardLayout title="Name">

                        <p>Your name is {this.props.state.application.application.account!.name}. </p>

                        <hr/>
                        <div className="flex flex-row items-baseline">
                            <Formik
                                initialValues={{ name: this.props.state.application.application.account!.name }}
                                initialStatus=""

                                validationSchema={Yup.object().shape({
                                    name: Yup.string()
                                        .min(1, 'Minimum 1 characters.')
                                        .max(200, 'Maximum 200 characters.')
                                        .required('Required.'),
                                })}

                                onSubmit={(values: API_CHANGE_NAME_REQ, actions: FormikActions<API_CHANGE_NAME_REQ>) => {
                                    actions.setStatus("")
                                    API_CHANGE_NAME(values)
                                        .then(response => {
                                            if (response.ok) {
                                                actions.setStatus("Names is changed. Refresh your browser for it to take effect.")
                                            } else {
                                                actions.setStatus("Something went wrong.")
                                            }
                                        })


                                    actions.setSubmitting(false)
                                }}
                                render={(formikBag: FormikProps<API_CHANGE_NAME_REQ>) => (
                                    <Form>
                                        <Field
                                            name="name"
                                            render={({ field, form }: FieldProps<API_CHANGE_NAME_REQ>) => (
                                                <div className=" ">
                                                    <div className="flex  flex-row items-center">

                                                        <div className="flex flex-col w-full mr-1">
                                                            <div><input type="text" {...field} placeholder="name" id="name" className="rounded p-1 border 	"/></div>
                                                        </div>
                                                        <div className=" text-xs w-full">
                                                            <Button submit title="Change name" secondary small />
                                                        </div>

                                                    </div>
                                                    <div className="p-1 text-red-500 text-xs font-bold">{form.touched.name && form.errors.name}</div>

                                                    <div className="p-1 text-xs font-bold">{formikBag.status}</div>
                                                </div>
                                            )}
                                        />
                                    </Form>
                                )}
                            />
                        </div>

                    </CardLayout>

                    <CardLayout title="Password">
                        <p>To change your password, initiate a <Link className="link" to={"/account/reset?email=" + this.props.state.application.application.account!.email}  >password reset</Link>.</p>
                    </CardLayout>

                    <CardLayout title="Delete account">
                        <p>By deleting your account, all your workspace memberships will be permanently deleted.</p>
                        <Formik
                            initialValues={{}}
                            onSubmit={(values: {}, actions: FormikActions<{}>) => {
                                API_DELETE_ACCOUNT()
                                    .then((response) => {
                                        if (response.ok) {
                                            window.location.href = "/";
                                        }
                                        else {
                                            response.json().then((data: any) => {
                                                // noinspection JSIgnoredPromiseFromCall
                                                this.props.newMessage('fail', data.message)
                                            })
                                        }
                                    }
                                    )
                            }}

                            render={(formikBag: FormikProps<{}>) => (
                                <Form>
                                    <p className="text-xs"><Button secondary button handleOnClick={() => this.setState({ reallySureWarning: true })} title="Delete account" /> {this.state.reallySureWarning && <Button submit warning title="Yes, I am really sure!" />} </p>
                                </Form>
                            )}
                        />

                    </CardLayout>

                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkspacesPage); 