import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import * as Yup from 'yup';
import { Formik, FormikHelpers as FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_CONTACT, API_CONTACT_INTERFACE } from '../api'
import { Button } from '../components/elements';
import { Link } from 'react-router-dom';

interface PropsFromState { }
interface RouterProps extends RouteComponentProps<{
}> { }
interface PropsFromDispatch { }
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    sent: boolean
}
class ContactPage extends Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { sent: false }
    }

    render() {
        return (

            < div className="flex p-2  w-full  justify-center items-center flex-col " >

                <div className="flex  p-3  max-w-xl w-full   items-center  flex-col   ">
                    <div className="flex  p-2 flex-col items-baseline">
                        <div className="p-1 "><h1 className={"text-3xl font-medium"}>Contact the Featmap team</h1></div>
                    </div>

                    {this.state.sent ?
                        <div>
                            <p>Thank you for your message, we will get back to you shortly!</p>
                            <p>Back to <Link className="link" to="/">Featmap</Link></p></div>
                        :
                        <div>
                            <div className="flex  p-2 flex-col items-baseline">
                                <div className="p-1 ">Specify a <b>topic</b>,  <b>message</b> and your <b>email adress</b>.</div>
                            </div>

                            <div className="mt-2 w-full">
                                <Formik
                                    initialValues={{ topic: "general", body: "", sender: "" }}

                                    validationSchema={Yup.object().shape({


                                        body: Yup.string()
                                            .min(1, 'Minimum 1 characters.')
                                            .max(10000, 'Maximum 10000 characters.')
                                            .required('Required.'),

                                        sender: Yup.string()
                                            .email('Invalid email adress.')
                                            .required('Required.'),
                                    })}

                                    onSubmit={(values: API_CONTACT_INTERFACE, actions: FormikActions<API_CONTACT_INTERFACE>) => {
                                        API_CONTACT(values)
                                            .then(response => {
                                                if (response.ok) {
                                                    this.setState({ sent: true })
                                                } else {
                                                    response.json().then(data => {
                                                        switch (data.message) {
                                                            case "email invalid": {
                                                                actions.setFieldError("sender", data.message)
                                                                break
                                                            }
                                                            case "message too short": {
                                                                actions.setFieldError("body", data.message)
                                                                break
                                                            }
                                                            case "message too long": {
                                                                actions.setFieldError("body", data.message)
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

                                >
                                    {(formikBag: FormikProps<API_CONTACT_INTERFACE>) => (
                                        <Form>
                                            {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}
                                            <div className="mb-3">
                                                <Field
                                                    name="topic"
                                                    component="select"
                                                    className="rounded p-2 border w-full text-lg    "
                                                >
                                                    <option value="general">General </option>
                                                    <option value="sales">Sales</option>
                                                    <option value="support">Support</option>
                                                </Field>
                                            </div>

                                            <Field
                                                name="body"
                                            >
                                                {({ form }: FieldProps<API_CONTACT_INTERFACE>) => (
                                                    <div className="flex  flex-row items-baseline">
                                                        <div className=" flex flex-col w-full">
                                                            <div><textarea autoFocus rows={20} value={form.values.body} onChange={form.handleChange} placeholder="Message" id="body" className="rounded p-2  border w-full  	" /></div>
                                                            <div className="m-1 text-red-500 text-xs font-bold">{form.touched.body && form.errors.body && form.errors.body}</div>
                                                        </div>
                                                    </div>
                                                )}

                                            </Field>
                                            <Field
                                                name="sender"
                                            >
                                                {({ form }: FieldProps<API_CONTACT_INTERFACE>) => (
                                                    <div className="flex  flex-row items-baseline">

                                                        <div className="flex flex-col w-full">
                                                            <div><input type="text" value={form.values.sender} onChange={form.handleChange} placeholder="Your email adress" id="sender" className="rounded p-2 border w-full text-lg	" /></div>
                                                            <div className="p-1 text-red-500 text-xs font-bold">{form.touched.sender && form.errors.sender && form.errors.sender}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Field>
                                            <div className="flex justify-center">
                                                <Button submit primary title="Send message" />
                                            </div>

                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    }


                </div>
            </div >
        );
    }
}

export default ContactPage