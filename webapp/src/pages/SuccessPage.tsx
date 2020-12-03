import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom';


interface PropsFromState { }
interface RouterProps extends RouteComponentProps<{
}> { }
interface PropsFromDispatch { }
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
}

class SuccessPage extends Component<Props, State> {
    render() {
        return (
            < div className="flex p-2  w-full  justify-center items-center flex-col " >
                <div className="flex  p-3  max-w-xl w-full   items-center  flex-col ">
                    <div className="flex  p-2 flex-col items-baseline">
                        <div className="p-1 "><h2><i className="material-icons text-3xl text-green-500">check</i> Plan change successful!</h2></div>
                        <div className="p-1 ">Back to <Link className="link" to="/">Featmap</Link>.</div>
                    </div>
                </div>
            </div >
        );
    }
}

export default SuccessPage