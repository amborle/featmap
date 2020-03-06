import { Button } from '../components/elements'
import React, { Component, FunctionComponent, useState, Dispatch } from 'react';
import { RouteComponentProps, } from 'react-router'
import { AppState, AllActions } from '../store'
import { application, getWorkspaceByName, getMembership, getSubscription } from '../store/application/selectors';
import { connect } from 'react-redux'
import { IApplication, IMembership, IInvite } from '../store/application/types';
import TimeAgo from 'react-timeago'
import { API_GET_MEMBERS, API_UPDATE_MEMBER_LEVEL, API_DELETE_MEMBER, API_GET_INVITES, API_CREATE_INVITE, API_DELETE_INVITE, API_LEAVE, API_DELETE_WORKSPACE, API_RESEND_INVITE, API_CHANGE_ALLOW_EXTERNAL_SHARING } from '../api';
import { Formik, FormikHelpers as FormikActions, FormikProps, Form, Field, } from 'formik';
import * as Yup from 'yup';
import { newMessage } from '../store/application/actions';
import { isEditor, SubscriptionLevels, memberLevelToTitle } from '../core/misc';
import { CardLayout } from '../components/elements';
import { receiveApp } from '../store/application/actions';

const mapStateToProps = (state: AppState) => ({
    application: application(state),
})

const mapDispatchToProps = (dispatch: Dispatch<AllActions>) => ({
    newMessage: newMessage(dispatch),
    receiveApp: receiveApp
})

interface PropsFromState {
    application: IApplication
}
interface RouterProps extends RouteComponentProps<{
    workspaceName: string
}> { }
interface PropsFromDispatch {
    newMessage: ReturnType<typeof newMessage>
    receiveApp: typeof receiveApp
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    myMembership?: IMembership
    members: IMembership[]
    invites: IInvite[]
    showMemberDetails: boolean
    memberId: string
    reallySureWarning: boolean
    allowExternalSharing: boolean
    isCompany: boolean,
    euVat: string,
    country: string
    externalBillingEmail: string
}

class WorkspaceSettingsPage extends Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            members: [],
            invites: [],
            showMemberDetails: false,
            memberId: "",
            reallySureWarning: false,
            allowExternalSharing: false,
            isCompany: false,
            euVat: "",
            country: "",
            externalBillingEmail: ""
        }
    }

    componentWillMount() {
        this.loadMembers()
        this.loadInvites()

        const ws = getWorkspaceByName(this.props.application, this.props.match.params.workspaceName)!
        this.setState({ allowExternalSharing: ws.allowExternalSharing })

    }

    loadInvites() {
        const ws = getWorkspaceByName(this.props.application, this.props.match.params.workspaceName)!
        API_GET_INVITES(ws.id)
            .then(response => {
                if (response.ok) {
                    response.json().then((data: IInvite[]) => {
                        this.setState({ invites: data })
                    })
                }
            })
    }


    loadMembers() {
        const ws = getWorkspaceByName(this.props.application, this.props.match.params.workspaceName)!

        API_GET_MEMBERS(ws.id)
            .then(response => {
                if (response.ok) {
                    response.json().then((data: IMembership[]) => {
                        this.setState({ members: data })
                    })
                }
            })
    }

    render() {
        const ws = getWorkspaceByName(this.props.application, this.props.match.params.workspaceName)!
        const m = getMembership(this.props.application, ws.id)
        const s = getSubscription(this.props.application, ws.id)
        const hasExpired = false
        type changeRoleForm = { level: string }
        type inviteForm = { email: string, level: string }

        type orgInfoForm = { isCompany: boolean, country: string, euVat: string, externalBillingEmail: string }

        const MemberBox: FunctionComponent<{ member: IMembership }> = (props) => {
            const [show, setShow] = useState(false);

            const isMyself = props.member.accountId === this.props.application.account!.id
            return (
                <div>
                    <div className="flex flex-row  ">
                        <div className="flex flex-grow flex-col">
                            <div className="">{props.member.name} ({props.member.email}) {isMyself && <span className="bg-gray-200 text-xs font-bold text-black p-1 ">THIS IS YOU</span>} </div>
                            <div className="text-xs mt-1"> {memberLevelToTitle(props.member.level)}. Joined <TimeAgo date={props.member.createdAt} />.</div>
                        </div>

                        {!isMyself && <div className=""><button onClick={() => setShow(!show)}> <i className="material-icons">expand_more</i></button> </div>}

                    </div >

                    {
                        !isMyself && show &&
                        <div className="flex flex-row ">

                            <div className="text-xs mt-3 flex-grow">
                                {!hasExpired && <Formik
                                    initialValues={{ level: props.member.level }}

                                    validationSchema={Yup.object().shape({
                                        level: Yup.string()
                                            .required('Required.')
                                    })}

                                    onSubmit={(values: changeRoleForm) => {

                                        API_UPDATE_MEMBER_LEVEL(ws.id, props.member.id, values.level)
                                            .then((response) => {

                                                response.json().then((data: any) => {
                                                    if (response.ok) {
                                                        this.loadMembers()
                                                        this.props.newMessage("success", "role changed")
                                                    }
                                                    else {
                                                        this.props.newMessage("fail", data.message)
                                                    }
                                                })
                                            }
                                            )
                                    }}
                                >
                                    {(formikBag: FormikProps<changeRoleForm>) => (
                                        <Form>
                                            {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}

                                            <div>
                                                <Field
                                                    name="level"
                                                    component="select"
                                                    className="rounded p-1 border mr-2"
                                                >
                                                    <option value="VIEWER">{memberLevelToTitle("VIEWER")}</option>
                                                    <option value="EDITOR">{memberLevelToTitle("EDITOR")}</option>
                                                    <option value="ADMIN">{memberLevelToTitle("ADMIN")}</option>
                                                    <option value="OWNER">{memberLevelToTitle("OWNER")}</option>
                                                </Field>
                                                <Button secondary small submit title="Change role" />
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                                }
                            </div>

                            <div className="flex text-xs mt-3 ml-3  justify-right">

                                <Formik
                                    initialValues={{ level: props.member.level }}

                                    validationSchema={Yup.object().shape({
                                        level: Yup.string()
                                            .required('Required.')
                                    })}

                                    onSubmit={() => {

                                        API_DELETE_MEMBER(ws.id, props.member.id)
                                            .then((response) => {
                                                if (response.ok) {
                                                    this.loadMembers()
                                                    this.props.newMessage("success", "membership removed")
                                                }
                                                else {
                                                    response.json().then((data: any) => {
                                                        this.props.newMessage("fail", data.message)
                                                    })
                                                }
                                            }
                                            )
                                    }}
                                >
                                    {(formikBag: FormikProps<changeRoleForm>) => (
                                        <Form>
                                            {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}
                                            <div>
                                                <Button warning submit small title="Delete" />
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    }
                </div >
            )
        }

        return (
            <div >
                <h3 className="p-2" > Workspace settings</h3 >

                <CardLayout title="My membership">
                    <p className="text-sm"> {memberLevelToTitle(m.level)}. Joined <TimeAgo date={m.createdAt} />.</p>
                    {
                        m.level !== "OWNER" ?   // Owners are not allowed to leave their own workspace
                            <div>
                                <Formik
                                    initialValues={{ email: "", level: 10 }}

                                    onSubmit={() => {

                                        API_LEAVE(ws.id)
                                            .then((response) => {
                                                if (response.ok) {
                                                    this.props.newMessage("success", "left workspace")
                                                    window.location.href = "/";
                                                }
                                                else {
                                                    response.json().then((data: any) => {
                                                        this.props.newMessage("fail", data.message)
                                                    })
                                                }
                                            }
                                            )
                                    }}
                                >
                                    {(formikBag: FormikProps<{}>) => (
                                        <Form>
                                            <p className="text-xs"><Button small warning submit title="Leave workspace" /></p>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                            :
                            null
                    }
                </CardLayout>


                {(m.level === "ADMIN" || m.level === "OWNER") && s.level === SubscriptionLevels.PRO ?
                    <CardLayout title="External link">
                        {
                            (() => {

                                const submit = () => {

                                    API_CHANGE_ALLOW_EXTERNAL_SHARING(ws.id, !this.state.allowExternalSharing)
                                        .then((response) => {
                                            if (response.ok) {
                                                this.setState({ allowExternalSharing: !this.state.allowExternalSharing })

                                                this.props.newMessage("success", "setting changed")
                                            }
                                            else {
                                                response.json().then((data: any) => {
                                                    this.props.newMessage("fail", data.message)
                                                })
                                            }
                                        }
                                        )
                                }

                                return (
                                    <div >
                                        <p><input onChange={submit} checked={this.state.allowExternalSharing} type="checkbox" /> Projects can be shared with people who are not members of the workspace (view only).</p>
                                    </div>
                                )
                            })()

                        }
                    </CardLayout>
                    :
                    null
                }



                {(m.level === "ADMIN" || m.level === "OWNER") ?
                    <CardLayout title="Workspace invites">
                        {
                            <div>
                                {!hasExpired &&
                                    <div className="">
                                        <Formik
                                            initialValues={{ email: "", level: "VIEWER" }}

                                            validationSchema={Yup.object().shape({
                                                email: Yup.string()
                                                    .email('Invalid.')
                                                    .required('Required.'),
                                                level: Yup.string()
                                                    .required('Required.')
                                            })}

                                            onSubmit={(values: inviteForm, actions: FormikActions<inviteForm>) => {
                                                API_CREATE_INVITE(ws.id, values.email, values.level)
                                                    .then((response) => {
                                                        if (response.ok) {
                                                            this.loadInvites()
                                                            this.props.newMessage("success", "invite sent")
                                                        }
                                                        else {
                                                            response.json().then((data: any) => {
                                                                this.props.newMessage("fail", data.message)
                                                            })
                                                        }
                                                    }
                                                    )
                                            }}

                                        >
                                            {(formikBag: FormikProps<inviteForm>) => (
                                                <Form>
                                                    {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}

                                                    <div className="flex flex-col ">
                                                        <div className="flex flex-col m-1">

                                                            <Field
                                                                name="email"
                                                                component="input"
                                                                className="rounded p-2 border  w-64  "
                                                                placeholder="email"
                                                            >
                                                            </Field>
                                                            {formikBag.touched.email && formikBag.errors.email && <div className="text-red-500 font-bold text-xs">{formikBag.errors.email}</div>}
                                                        </div>

                                                        <div className="flex flex-col m-1">
                                                            <Field
                                                                name="level"
                                                                component="select"
                                                                className="rounded p-2 border  w-64  bg-white  "
                                                            >
                                                                <option value="VIEWER">{memberLevelToTitle("VIEWER")}</option>
                                                                <option value="EDITOR">{memberLevelToTitle("EDITOR")}</option>
                                                                <option value="ADMIN">{memberLevelToTitle("ADMIN")}</option>
                                                                <option value="OWNER">{memberLevelToTitle("OWNER")}</option>
                                                            </Field>
                                                        </div>
                                                        <div className="text-xs m-1"><Button submit secondary title="Send invitation" /></div>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>

                                    </div>
                                }

                                <div className="mt-2">
                                    <div className="flex flex-col  max-w-2xl  " >
                                        <div className="p-3 text-sm ">
                                            {this.state.invites.length}  pending invite(s)
                                        </div>
                                        <div className=" p-1  ">
                                            {
                                                this.state.invites.map(x =>
                                                    (<div className=" p-2 w-full" key={x.id}>
                                                        <p>{x.email}</p>
                                                        <p className="">Invited as <b>{memberLevelToTitle(x.level)}</b> by {x.createdByName} <TimeAgo date={x.createdAt} />. </p>
                                                        <div className="flex flex-row  mt-1">
                                                            <div>
                                                                <Formik
                                                                    initialValues={{ email: "", level: 10 }}

                                                                    onSubmit={() => {


                                                                        API_DELETE_INVITE(ws.id, x.id)
                                                                            .then((response) => {
                                                                                if (response.ok) {
                                                                                    this.loadInvites()
                                                                                    this.props.newMessage("success", "invite canceled")
                                                                                }
                                                                                else {
                                                                                    response.json().then((data: any) => {
                                                                                        this.props.newMessage("fail", data.message)
                                                                                    })
                                                                                }
                                                                            }
                                                                            )
                                                                    }}
                                                                >
                                                                    {(formikBag: FormikProps<{}>) => (
                                                                        <Form>
                                                                            <span className="text-xs"><Button small secondary submit title="Cancel invite" /></span>
                                                                        </Form>
                                                                    )}
                                                                </Formik>
                                                            </div>
                                                            {!hasExpired && <div className="ml-1">
                                                                <Formik
                                                                    initialValues={{}}
                                                                    onSubmit={(values: {}, actions: FormikActions<{}>) => {
                                                                        API_RESEND_INVITE(ws.id, x.id)
                                                                            .then((response) => {
                                                                                if (response.ok) {
                                                                                    this.loadInvites()
                                                                                    this.props.newMessage("success", "invite resent")
                                                                                }
                                                                                else {
                                                                                    response.json().then((data: any) => {
                                                                                        this.props.newMessage("fail", data.message)
                                                                                    })
                                                                                }
                                                                            }
                                                                            )
                                                                    }}
                                                                >
                                                                    {(formikBag: FormikProps<{}>) => (
                                                                        <Form>
                                                                            <span className="text-xs"><Button small secondary submit title="Resend invite" /></span>
                                                                        </Form>
                                                                    )}
                                                                </Formik>
                                                            </div>}

                                                        </div>
                                                    </div>
                                                    )
                                                )
                                            }
                                        </div>
                                    </div>

                                </div>

                            </div>
                        }

                    </CardLayout>
                    :
                    null
                }

                {(m.level === "ADMIN" || m.level === "OWNER") ? // Admin or higher}
                    <CardLayout title="Members">
                        {

                            <div>

                                <div className="flex flex-col  text-sm mt-2   max-w-2xl " >
                                    <div className="p-2  ">
                                        {this.state.members.length}  member(s),  {this.state.members.filter(x => isEditor(x.level)).length} editor(s)
                                    </div>
                                    <div className=" text-sm   ">
                                        {
                                            this.state.members.map(x =>
                                                (<div className=" p-2 w-full" key={x.id}>
                                                    <MemberBox member={x} />
                                                </div>
                                                )
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        }
                    </CardLayout>
                    :
                    null
                }



                {
                    (m.level === "OWNER") ? // Admin or higher
                        <CardLayout title="Delete workspace">
                            <div>
                                <p >All projects in this workspace will be deleted permanently. You need to cancel any active subscriptions before the workspace can be deleted.  </p>

                                <Formik
                                    initialValues={{}}
                                    onSubmit={(values: {}, actions: FormikActions<{}>) => {
                                        API_DELETE_WORKSPACE(ws.id)
                                            .then((response) => {
                                                if (response.ok) {
                                                    this.props.newMessage("success", "workspace deleted")
                                                    window.location.href = "/";
                                                }
                                                else {
                                                    response.json().then((data: any) => {
                                                        this.props.newMessage("fail", data.message)
                                                    })
                                                }
                                            }
                                            )
                                    }}
                                >
                                    {(formikBag: FormikProps<{}>) => (
                                        <Form>
                                            <p className="text-xs"><Button secondary button handleOnClick={() => this.setState({ reallySureWarning: true })} title="Delete workspace" /> {this.state.reallySureWarning && <Button submit warning title="Yes, I am really sure!" />} </p>
                                        </Form>
                                    )}
                                </Formik>

                            </div>

                        </CardLayout>
                        :
                        null
                }
            </div >
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceSettingsPage)