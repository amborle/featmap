import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { API_VERIFY_EMAIL } from '../api'

interface PropsFromState { }
interface RouterProps extends RouteComponentProps<{
    key: string
}> { }
interface PropsFromDispatch { }
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    ok: boolean
}

class VerifyEmailPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            ok: false
        }
    }

    componentDidMount() {
        API_VERIFY_EMAIL(this.props.match.params.key).then(response => {
            if (response.ok) {
                this.setState({ ok: true })
            }
        }
        )
    }

    render() {
        return this.state.ok ?
            <div className="p-2">
                <em>Email adress verified!</em>
                <br /><br />
                <Link className="link" to="/">Back to Featmap</Link>
            </div>
            :
            "Something went wrong"
    }
}

export default VerifyEmailPage