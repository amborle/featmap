import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import onClickOutside from "react-onclickoutside";
import EntityDetailsBody from './EntityDetailsBody';
import { EntityTypes } from '../core/card'
import { IFeatureComment } from '../store/featurecomments/types';

const mapStateToProps = (state: AppState) => ({
})

const mapDispatchToProps = {
}

interface PropsFromState { }

interface PropsFromDispatch {
}


interface SelfProps {
  entity: EntityTypes
  comments: IFeatureComment[]
  url: string
  close: () => void
  viewOnly: boolean
  demo: boolean 
}



type Props = PropsFromState & PropsFromDispatch & SelfProps

interface State {

}


class EntityDetailsModal extends Component<Props, State> {

  keydownHandler = (event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      this.props.close()
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keydownHandler, false);
  }

  render() {
    const Body = class Body extends Component<{  comments: IFeatureComment[], demo: boolean; viewOnly: boolean, url: string, card: EntityTypes, close: () => void }> {

      handleClickOutside = () => {
        this.props.close()
      }

      render() {
        return (
          <div className=" w-full  max-w-5xl   fm-max-dialog  overflow-y-auto ">
            <EntityDetailsBody demo={this.props.demo} viewOnly={this.props.viewOnly} url={this.props.url} comments={this.props.comments} entity={this.props.card} close={this.props.close} />
          </div>
        )
      }
    }

    const DialogWithClickOutside = onClickOutside(Body)

    return (
      <div style={{ background: ' rgba(0,0,0,.75)' }} className="fixed p-5 z-0 top-0 left-0 h-full w-full  flex items-start  bg-gray-100 text-sm" >
        <DialogWithClickOutside demo={this.props.demo} comments={this.props.comments} viewOnly={this.props.viewOnly} url={this.props.url} card={this.props.entity} close={this.props.close} />
      </div >
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityDetailsModal)
