import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'

import { createFeatureCommentAction, updateFeatureCommentAction, deleteFeatureCommentAction } from '../store/featurecomments/actions';
import { Formik, FormikHelpers as FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import { API_CREATE_FEATURE_COMMENT, API_DELETE_FEATURE_COMMENT, API_UPDATE_FEATURE_COMMENT_POST } from "../api";

import { v4 as uuid } from 'uuid'
import * as Yup from 'yup';
import { application, getMembership } from '../store/application/selectors';
import { IApplication } from '../store/application/types';
import { EntityTypes } from '../core/card'
import { Button } from './elements';
import { IFeatureComment } from '../store/featurecomments/types';
import Comment from './Comment';

const mapStateToProps = (state: AppState) => ({
    application: application(state)
})

const mapDispatchToProps = {
    createFeatureComment: createFeatureCommentAction,
    deleteFeatureComment: deleteFeatureCommentAction,
    updateFeatureComment: updateFeatureCommentAction,
}

interface PropsFromState {
    application: IApplication
}

interface PropsFromDispatch {
    createFeatureComment: typeof createFeatureCommentAction
    updateFeatureComment: typeof updateFeatureCommentAction
    deleteFeatureComment: typeof deleteFeatureCommentAction
}
interface SelfProps {
    entity: EntityTypes
    comments: IFeatureComment[]
    app: IApplication
    viewOnly: boolean
    demo: boolean
    open: boolean
}
type Props = PropsFromState & PropsFromDispatch & SelfProps

interface State {
}


class EntityDetailsComments extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.submitForm = () => { }

    }

    submitForm: () => void;

    deleteComment = (id: string) => {

        this.props.deleteFeatureComment(id) // optimistic 

        if (!this.props.demo) {
            API_DELETE_FEATURE_COMMENT(
                this.props.entity.workspaceId,
                id)
                .then(response => {
                    if (response.ok) {
                        this.props.deleteFeatureComment(id)

                    } else {
                        alert("Something went wrong when deleting comment.")
                    }
                }
                )
        }

    }

    editComment = (comment: IFeatureComment, post: string) => {
        const optimistic = comment
        optimistic.post = post
        optimistic.lastModified = new Date().toISOString()
        this.props.updateFeatureComment(optimistic)

        if (!this.props.demo) {
            API_UPDATE_FEATURE_COMMENT_POST(
                this.props.entity.workspaceId, comment.id,
                post)
                .then(response => {
                    if (response.ok) {
                        response.json().then((data: IFeatureComment) => {
                            this.props.updateFeatureComment(data)
                        }
                        )
                    } else {
                        alert("Something went wrong when editing a comment.")
                    }
                }
                )
        }
    }


    render() {
        const member = getMembership(this.props.app, this.props.entity.workspaceId)

        return (
            <div className=" self-start w-full mb-4 " >

                <div className=" mt-2 ml-2 border border-white  ">
                    <div className="font-medium text-sm text-gray-600">
                        DISCUSSION {this.props.comments.length === 0 ? "" : "(" + this.props.comments.length + ")"}
                    </div>

                    {!this.props.viewOnly ?
                        <Formik
                            initialValues={{ comment: "" }}

                            validationSchema={Yup.object().shape({
                                comment: Yup.string()
                                    .required("Please write a comment.")
                                    .max(10000, 'Maximum 10000 characters.')
                            })}

                            onSubmit={(values: { comment: string }, actions: FormikActions<{ comment: string }>) => {

                                const id = uuid()
                                const t = new Date().toISOString()
                                const by = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                                const optimistic: IFeatureComment = {
                                    kind: "featureComment",
                                    id: id,
                                    workspaceId: this.props.entity.workspaceId,
                                    featureId: this.props.entity.id,
                                    projectId: "",
                                    createdAt: t,
                                    createdByName: by,
                                    lastModified: t,
                                    post: values.comment,
                                    memberId: member === undefined ? "demo" : member.id
                                }

                                this.props.createFeatureComment(optimistic)

                                if (!this.props.demo) {
                                    API_CREATE_FEATURE_COMMENT(
                                        optimistic.workspaceId,
                                        optimistic.featureId,
                                        optimistic.id,
                                        optimistic.post)
                                        .then(response => {
                                            if (response.ok) {
                                                response.json().then((data: IFeatureComment) => {
                                                    this.props.updateFeatureComment(data)
                                                }
                                                )
                                            } else {
                                                alert("Something went wrong when posting a comment.")
                                            }
                                        }
                                        )
                                }


                                // actions.setSubmitting(false)
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
                                            {({ form }: FieldProps<{ description: string }>) => (
                                                <div className="flex flex-col mt-2  ">
                                                    <div >
                                                        <textarea rows={2} value={form.values.description} onChange={form.handleChange} placeholder="Write a comment... " id="comment" className="rounded p-3  border w-full  	" />
                                                    </div>
                                                    <div className="p-1 text-red-500 text-xs font-bold">{form.touched.comment && form.errors.comment}</div>
                                                    <div className="flex justify-end">
                                                        <div><Button submit title="Post comment" /> </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Field>

                                    </Form>
                                )
                            }}
                        </Formik>
                        : null
                    }


                    <div>
                        {this.props.comments.length === 0 ? (
                            <div>No comments.</div>
                        ) : (
                                <div >
                                    {this.props.comments.map(
                                        comment => {
                                            return <div className=" bg-white  mt-4" key={comment.id} >

                                                <Comment demo={this.props.demo} viewOnly={this.props.viewOnly} comment={comment} member={member} deleteComment={this.deleteComment} editComment={this.editComment} />

                                                {/* <div className="flex flex-row items-center">
                                                    <div className="flex-grow text-xs  "><span className="font-medium">{comment.createdByName}</span> wrote <TimeAgo date={comment.createdAt} /> </div>

                                                    {member.id === comment.memberId ?
                                                        <div>
                                                            <ContextMenu icon="more_horiz">
                                                                <div className="rounded bg-white shadow-md  absolute mt-8 top-0 right-0 min-w-full text-xs" >
                                                                    <ul className="list-reset">
                                                                        <li><Button noborder title="Edit" icon="edit" handleOnClick={() => this.deleteComment(comment.id)} /></li>
                                                                        <li><Button noborder title="Delete" icon="delete" warning handleOnClick={() => this.deleteComment(comment.id)} /></li>
                                                                    </ul>
                                                                </div>
                                                            </ContextMenu>
                                                        </div>
                                                        :
                                                        null}

                                                </div>
                                                <div><span className="text-xs  "></span></div>

                                                <div className="markdown-body">
                                                    <ReactMarkdown source={comment.post} linkTarget="_blank" />
                                                </div> */}

                                            </div>
                                        })}
                                </div>
                            )
                        }
                    </div>
                </div>





            </div>)

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityDetailsComments)