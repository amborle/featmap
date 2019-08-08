import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import * as Yup from 'yup';
import { Formik, FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_LOG_IN_REQ, API_LOG_IN as LoginApi } from '../api'
import { Link } from 'react-router-dom'
import { Button } from '../components/elements';


const SignupSchema = Yup.object().shape({
    email: Yup.string()
        .email('Email invalid.')
        .required('Email required.'),
    password: Yup.string()
        .min(6, 'Password minimum 6 characters.')
        .max(200, 'Password maximum 200 characters.')
        .required('Password required.'),
});

interface PropsFromState { }
interface RouterProps extends RouteComponentProps<{
}> { }
interface PropsFromDispatch { }
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps
class LogIn extends Component<Props> {
    render() {
        const { history } = this.props
        return (
            <div className="flex p-2  w-full  justify-center items-center flex-col ">
                <div className="flex  p-3  max-w-xl w-full   items-center  flex-col  ">
                    <div className="flex  p-2 flex-col items-baseline">
                        <div className="p-1 "><h1 className={"text-3xl font-medium"}>Log in to Featmap</h1></div>
                    </div>
                    <div className="flex  p-2 flex-col items-baseline">
                        <div className="p-1 ">Enter your <b>email adress</b> and <b>password</b>.</div>
                    </div>

                    <div>
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            initialStatus=""

                            validationSchema={SignupSchema}

                            onSubmit={(values: API_LOG_IN_REQ, actions: FormikActions<API_LOG_IN_REQ>) => {
                                actions.setStatus("")
                                LoginApi(values)
                                    .then(response => {
                                        if (response.ok) {
                                            response.json().then(data => {
                                                history.push("/")
                                            })
                                        } else {
                                            actions.setStatus("Email or password is incorrect.")
                                        }
                                    })


                                actions.setSubmitting(false)
                            }}
                            render={(formikBag: FormikProps<API_LOG_IN_REQ>) => (
                                <Form>
                                    <div className="p-1 text-red-500 text-xs font-bold">{formikBag.status}</div>

                                    <Field
                                        name="email"
                                        render={({ field, form }: FieldProps<API_LOG_IN_REQ>) => (
                                            <div className="flex  flex-row items-baseline">
                                                <div className="flex flex-col w-full">
                                                    <div><input type="text" {...field} placeholder="Email" id="email" className="rounded p-2 border w-64 text-lg	"/></div>
                                                    <div className="p-1 text-red-500 text-xs font-bold">{form.touched.email && form.errors.email}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <Field
                                        name="password"
                                        render={({ field, form }: FieldProps<API_LOG_IN_REQ>) => (
                                            <div className="flex flex-row items-baseline">

                                                <div className="flex flex-col w-full">
                                                    <div><input type="password" {...field} placeholder="Password" id="password" className="rounded p-2 border w-64 text-lg	"/></div>
                                                    <div className="p-1 text-red-500 text-xs font-bold">{form.touched.password && form.errors.password}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <div className="flex flex-row  items-baseline justify-center">
                                        <div className="  justify-center">
                                            <Button primary submit title="Log in"/>
                                        </div>
                                    </div>

                                </Form>
                            )}
                        />
                    </div>
                    <div className="flex  p-2 flex-col ">
                        <div className="p-1 text-center">Not a member? <Link className="link" to="/account/signup">Create an account</Link></div>
                        <div className="p-1 text-center ">Forgotten your password? <Link className="link" to="/account/reset">Reset password </Link></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LogIn