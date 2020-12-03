import React, { Component } from 'react';
import { IFeatureComment } from '../store/featurecomments/types';
import TimeAgo from 'react-timeago'
import { IMembership } from '../store/application/types';
import ContextMenu from './ContextMenu';
import { Button } from './elements';
import ReactMarkdown from 'react-markdown';
import { Formik, FormikHelpers as FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

type Props = {
  comment: IFeatureComment
  member: IMembership
  viewOnly: boolean
  demo: boolean
  deleteComment: (id: string) => void
  editComment: (comment: IFeatureComment, post: string) => void
};

type State = {
  editing: boolean
  post: string
};

class Comment extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.submitForm = () => { }
    this.state = {
      editing: false,
      post: props.comment.post
    }
  }

  submitForm: () => void;

  render() {

    const owner = this.props.member === undefined ? "demo" === this.props.comment.memberId : this.props.member.id === this.props.comment.memberId



    return (
      <div>
        <div className="flex flex-row items-center">
          <div className="text-xs flex-grow "><span className="font-medium">{this.props.comment.createdByName}</span> <TimeAgo date={this.props.comment.createdAt} />

          </div>
          <div className="text-xs ">{this.props.comment.createdAt === this.props.comment.lastModified ? null : <span className="italic">Edited <TimeAgo date={this.props.comment.lastModified} /> </span>}</div>

          {!this.props.viewOnly && owner ?
            <div>
              <ContextMenu icon="more_horiz">
                <div className="rounded bg-white shadow-md  absolute mt-8 top-0 right-0 min-w-full text-xs z-20" >
                  <ul className="list-reset">
                    <li><Button noborder title="Edit" icon="edit" handleOnClick={() => this.setState({ editing: true })} /></li>
                    <li><Button noborder title="Delete" icon="delete" warning handleOnClick={() => this.props.deleteComment(this.props.comment.id)} /></li>
                  </ul>
                </div>
              </ContextMenu>
            </div>
            :
            null}

        </div>

        <div><span className="text-xs  "></span></div>

        {
          this.state.editing ?

            <Formik
              initialValues={{ comment: this.props.comment.post }}

              validationSchema={Yup.object().shape({
                comment: Yup.string()
                  .min(1, 'Minimum 1 character.')
                  .max(10000, 'Maximum 10000 characters.')
              })}

              onSubmit={(values: { comment: string }, actions: FormikActions<{ comment: string }>) => {
                this.props.editComment(this.props.comment, values.comment)
              }}
            >
              {(formikBag: FormikProps<{ comment: string }>) => {

                this.submitForm = formikBag.submitForm

                return (
                  <Form  >

                    {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}
                    <Field
                      name="comment"
                    >
                      {({ form }: FieldProps<{ comment: string }>) => (
                        <div className="flex flex-col mt-2  ">
                          <div >
                            <textarea rows={5} onChange={form.handleChange} name="comment" value={form.values.comment} id="comment" className="rounded p-3  border w-full " />
                          </div>
                          <div className=" text-red-500 text-xs font-bold">{form.touched.comment && form.errors.comment}</div>
                          <div className="flex justify-end">
                            <div className="mr-2"><Button primary submit title="Save" /> </div>
                            <div><Button handleOnClick={() => this.setState({ editing: false })} title="Cancel" /> </div>
                          </div>
                        </div>
                      )}
                    </Field>

                  </Form>
                )
              }}
            </Formik>
            :
            <div className="markdown-body">
              <ReactMarkdown source={this.props.comment.post} linkTarget="_blank" />
            </div>
        }

      </div>




    );
  }
}

export default Comment;
