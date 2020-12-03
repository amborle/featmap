import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { Button } from '../components/elements'

interface PropsFromState { }
interface RouterProps extends RouteComponentProps<{
}> { }
interface PropsFromDispatch { }
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
}

class SignupSuccessPage extends Component<Props, State> {
    render() {
        const { history } = this.props
        return (
            <div className="flex p-2  w-full  justify-center items-center flex-col " >
                <div className="flex  p-3  max-w-xl w-full   items-center  flex-col ">
                    <div className="flex  p-2 flex-col items-baseline">
                        <div className="p-1 text-2xl font-bold ">Welcome to Featmap!</div>
                        <div className="p-1 text-center "> <Button title="Get started" primary handleOnClick={() => history.push("/")} /></div>
                    </div>
                </div>
            </div >
        );
    }
}

export default SignupSuccessPage