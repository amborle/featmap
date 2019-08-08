import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { application } from '../store/application/selectors'
import { IApplication } from '../store/application/types';


const mapStateToProps = (state: AppState) => ({
  application: application(state)
})

const mapDispatchToProps = {

}

interface PropsFromState {
  application: IApplication
}

interface PropsFromDispatch {

}
interface SelfProps {
}
type Props = PropsFromState & PropsFromDispatch & SelfProps

interface State {
}

class Messages extends Component<Props, State> {

  render() {
    if (this.props.application.messages.length > 0) {
      return (
        <div className="flex fixed w-full  justify-center p-5  z-0 top-0 left-0" >
          <div className="flex flex-col bg-gray-200 ">
            {this.props.application.messages.map(x => (
              <div className="flex flex-row   p-1  items-center " key={x.id}>
                {x.type === "success" && <div className="mr-1"><i className="material-icons text-green-500">done</i> </div>}
                {x.type === "fail" && <div className="mr-1"><i className="material-icons text-red">error</i> </div>}
                <div className="flex  flex-grow">{x.message} </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    else return null
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Messages)
