import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { application, getWorkspaceByName } from '../store/application/selectors'
import { createProject } from '../store/projects/actions';
import { Dispatch } from "react";
import { AllActions } from "../store";
import { IProject } from "../store/projects/types";
import { Formik, FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_CREATE_PROJECT } from "../api";
import { v4 as uuid } from 'uuid'
import * as Yup from 'yup';
import { IApplication } from '../store/application/types';
import { Button } from './elements';

const mapStateToProps = (state: AppState) => ({
  application: application(state)
})


const mapDispatchToProps = {
  createProject
}

interface PropsFromState {
  application: IApplication

}

interface PropsFromDispatch {
  createProject: typeof createProject,
}
interface SelfProps {
  workspaceName: string,
  close: () => void
}
type Props = PropsFromState & PropsFromDispatch & SelfProps

interface State {
  show: boolean
}

const Schema = Yup.object().shape({
  title: Yup.string()
    .min(1, 'Project minimum 1 characters.')
    .max(200, 'Project  maximum 200 characters.')
    .required('Title required.')
});


export const submit = (dispatch: Dispatch<AllActions>) => {
  return (workspaceId: string, title: string) => {

    const projectId = uuid()

    return API_CREATE_PROJECT(workspaceId, projectId, title)
      .then(response => {
        if (response.ok) {
          response.json().then((data: IProject) => {
            dispatch(createProject(data))
          })
        }
      }
      )
  }
}


interface formValues {
  title: string
}

class CreateProjectModal extends Component<Props, State> {

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
            initialValues={{ title: '' }}

            validationSchema={Schema}

            onSubmit={(values: formValues, actions: FormikActions<formValues>) => {
              const projectId = uuid()

              const workspaceId = getWorkspaceByName(this.props.application, this.props.workspaceName)!.id

              API_CREATE_PROJECT(workspaceId, projectId, values.title)
                .then(response => {
                  if (response.ok) {
                    response.json().then((data: IProject) => {
                      this.props.createProject(data)
                      this.props.close()
                    })
                  } else {
                    response.json().then(data => {
                      switch (data.message) {
                        case "title_invalid": {
                          actions.setFieldError("title", "Title is invalid.")
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
                  <div className="mb-2"> Create project </div>

                  <div>

                    <Field
                      name="title"
                      render={({ field, form }: FieldProps<formValues>) => (

                        <div className="flex flex-col">
                          <div><input autoFocus type="text" {...field} placeholder="Title" id="title" className="rounded p-2 border w-full	"/></div>
                          <div className="p-1 text-red-500 text-xs font-bold">{form.touched.title && form.errors.title}</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateProjectModal)
