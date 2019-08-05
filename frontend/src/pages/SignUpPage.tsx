import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import * as Yup from 'yup';
import { Formik, FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_SIGN_UP_REQ, API_SIGN_UP as SignUpApi } from '../api'
import { Link } from 'react-router-dom'
import { Button } from '../components/elements';


const SignupSchema = Yup.object().shape({
    workspaceName: Yup.string()
        .matches(/^[a-z0-9]+$/, "Lowercase alphanumerics only. Spaces not allowed.")
        .min(2, 'Minimum 2 characters.')
        .max(200, 'Maximum 200 characters.')
        .required('Required.'),
    name: Yup.string()
        .min(1, 'Minimum 1 characters.')
        .max(200, 'Maximum 200 characters.')
        .required('Required.'),

    email: Yup.string()
        .email('Invalid email adress.')
        .required('Required.'),
    password: Yup.string()
        .min(6, 'Minimum 6 characters.')
        .max(200, 'Maximum 200 characters.')
        .required('Required.'),
});

interface PropsFromState { }
interface RouterProps extends RouteComponentProps<{
}> { }
interface PropsFromDispatch { }
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps
class SignUp extends Component<Props> {
    render() {
        const { history } = this.props
        return (
            <div className="flex p-2  w-full  justify-center items-center flex-col ">
                <div className="flex  p-3  max-w-xl w-full   items-center  flex-col  ">
                    <div className="flex  p-2 flex-col items-baseline">
                        <div className="p-1 "><h1 className={"text-3xl font-medium"}>Create a Featmap account</h1></div>
                    </div>
                    <div className="flex  p-2 flex-col items-baseline">
                        <div className="p-1 ">Enter the name of your <b>workspace</b>,  <b>work email adress</b> and <b>password</b>.</div>
                    </div>

                    <div className="flex max-w-xs">
                        <Formik
                            initialValues={{ workspaceName: '', name: '', email: '', password: '' }}

                            validationSchema={SignupSchema}

                            onSubmit={(values: API_SIGN_UP_REQ, actions: FormikActions<API_SIGN_UP_REQ>) => {
                                SignUpApi(values)
                                    .then(response => {
                                        if (response.ok) {
                                            response.json().then(data => {
                                                history.push("/")
                                            })
                                        } else {
                                            response.json().then(data => {
                                                switch (data.message) {
                                                    case "email_invalid": {
                                                        actions.setFieldError("email", "Email is invalid.")
                                                        break
                                                    }
                                                    case "workspace_invalid": {
                                                        actions.setFieldError("workspaceName", "Workspace is invalid.")
                                                        break
                                                    }
                                                    case "name_invalid": {
                                                        actions.setFieldError("name", "Name is invalid.")
                                                        break
                                                    }
                                                    case "password_invalid": {
                                                        actions.setFieldError("password", "Password is invalid.")
                                                        break
                                                    }
                                                    case "email_taken": {
                                                        actions.setFieldError("email", "Email is already registered.")
                                                        break
                                                    }
                                                    case "workspace_taken": {
                                                        actions.setFieldError("workspaceName", "Workspace name is already registrered.")
                                                        break
                                                    }
                                                    default: {
                                                        break
                                                    }
                                                }
                                            })
                                        }
                                    })


                                actions.setSubmitting(false)
                            }}
                            render={(formikBag: FormikProps<API_SIGN_UP_REQ>) => (
                                <Form>
                                    {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}
                                    <Field
                                        name="workspaceName"
                                        render={({ field, form }: FieldProps<API_SIGN_UP_REQ>) => (
                                            <div className="flex flex-col    items-baseline sm:flex-row">
                                                <div className="text-lg font-bold p-1 whitespace-no-wrap text-right ">featmap.com /</div>
                                                <div className=" flex flex-col w-full">
                                                    <div><input type="text" {...field} placeholder="workspace name" id="workspaceName" className="rounded p-2 border w-full text-lg	"/></div>
                                                    <div className="m-1 text-red-500 text-xs font-bold">{form.touched.workspaceName && form.errors.workspaceName && form.errors.workspaceName}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <Field
                                        name="name"
                                        render={({ field, form }: FieldProps<API_SIGN_UP_REQ>) => (
                                            <div className="flex  flex-row items-baseline">
                                                <div className=" flex flex-col w-full">
                                                    <div><input type="text" {...field} placeholder="Name, e.g. John Smith" id="name" className=" w-full rounded p-2 border  text-lg	"/></div>
                                                    <div className="m-1 text-red-500 text-xs font-bold">{form.touched.name && form.errors.name && form.errors.name}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <Field
                                        name="email"
                                        render={({ field, form }: FieldProps<API_SIGN_UP_REQ>) => (
                                            <div className="flex  flex-row items-baseline">

                                                <div className="flex flex-col w-full">
                                                    <div><input type="text" {...field} placeholder="Work email" id="email" className="rounded p-2 border w-full text-lg	"/></div>
                                                    <div className="p-1 text-red-500 text-xs font-bold">{form.touched.email && form.errors.email && form.errors.email}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <Field
                                        name="password"
                                        render={({ field, form }: FieldProps<API_SIGN_UP_REQ>) => (
                                            <div className="flex flex-row items-baseline">
                                                <div className="flex flex-col w-full">
                                                    <div><input type="password" {...field} placeholder="Password" id="password" className="rounded p-2 border w-full text-lg	"/></div>
                                                    <div className="p-1 text-red-500 text-xs font-bold">{form.touched.password && form.errors.password && form.errors.password}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <div className="flex justify-center">
                                        <Button submit primary title="Create account"/>
                                    </div>

                                </Form>
                            )}
                        />
                    </div>
                    <div className="flex  p-2 flex-col ">
                        <div className="p-1 text-center">Already have an account? <Link className="link" to="/account/login">Login</Link></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SignUp