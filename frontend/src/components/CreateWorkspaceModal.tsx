import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { application } from '../store/application/selectors'
import { Dispatch } from "react";
import { AllActions } from "../store";
import { Formik, FormikActions, FormikProps, Form, Field, FieldProps, } from 'formik';
import { API_CREATE_WORKSPACE } from "../api";
import * as Yup from 'yup';
import { IApplication, IWorkspace } from '../store/application/types';
import { Button } from './elements';

import { getApp, newMessage } from "../store/application/actions";

const mapDispatchToProps = (dispatch: Dispatch<AllActions>) => (
  {
    getApp: getApp(dispatch),
    newMessage: newMessage(dispatch)
  }
)

const mapStateToProps = (state: AppState) => ({
  application: application(state)
})


interface PropsFromState {
  application: IApplication

}

interface PropsFromDispatch {
  getApp: ReturnType<typeof getApp>
  newMessage: ReturnType<typeof newMessage>
}

interface SelfProps {
  close: () => void
}
type Props = PropsFromState & PropsFromDispatch & SelfProps

interface State {
  show: boolean
}

const Schema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[a-z0-9]+$/, "Lowercase alphanumerics only. Spaces not allowed.")
    .min(2, 'Minimum 2 characters.')
    .max(200, 'Maximum 200 characters.')
    .required('Required.'),
});

interface formValues {
  name: string
}

class CreateWorkspaceModal extends Component<Props, State> {
  keydownHandler = (event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      this.props.close()
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keydownHandler, false);
  }

  render() {

    const bg = {
      background: ' rgba(0,0,0,.75)',
    };

    return (
      <div style={bg} className="fixed p-1 z-0 top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 text-sm">
        <div className="bg-white p-3 w-full  max-w-xs">

          <Formik
            initialValues={{ name: '' }}

            validationSchema={Schema}

            onSubmit={(values: formValues, actions: FormikActions<formValues>) => {

              API_CREATE_WORKSPACE(values.name)
                .then(response => {
                  if (response.ok) {
                    response.json().then((data: IWorkspace) => {
                      // noinspection JSIgnoredPromiseFromCall
                        this.props.getApp()
                      this.props.close()
                    })
                  } else {
                    response.json().then(data => {
                      switch (data.message) {
                        case "name_invalid": {
                          actions.setFieldError("name", "Name is invalid.")
                          break
                        }
                        case "workspace_taken": {
                          actions.setFieldError("name", "The name is already taken.")
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
            render={(formikBag: FormikProps<formValues>) => (
              <Form>
                {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}

                <div className="flex flex-col ">
                  <div className="mb-2"> Create workspace </div>

                  <div>

                    <Field
                      name="name"
                      render={({ field, form }: FieldProps<formValues>) => (

                        <div className="flex flex-col">
                          <div className="flex flex-row items-center">
                            <div className="mr-1 font-bold">
                              featmap.com /
                           </div>

                            <div >
                              <input autoFocus type="text" {...field} placeholder="Name" id="name" className="rounded p-2 border w-full	"/>
                            </div>

                          </div>
                          <div className="p-1 text-red-500 text-xs font-bold">{form.touched.name && form.errors.name}</div>
                        </div>

                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <div className="flex flex-row">
                      <div className="mr-1">
                        <Button submit title="Create" primary />
                      </div>
                      <div>
                        <Button title="Cancel" handleOnClick={this.props.close} />
                      </div>
                    </div>
                  </div>
                </div>

              </Form>
            )}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateWorkspaceModal)
