import React, { Component } from 'react';
import onClickOutside from "react-onclickoutside";

interface Props {
  icon: string
  night?: boolean
  text?: string
  smallIcon?: boolean
}

interface State {
  expand: boolean
}

class ContextMenu extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expand: false
    }
  }

  handleClickOutside = () => {
    if (this.state.expand) {
      this.setState({ expand: false })
    }
  }

  render() {

    return (
      <div  >
        <div className="relative">
          <div className="flex items-center ">
            <button onClick={() => this.setState((state) => { return { expand: !state.expand } })} className="flex text-sm p-1 rounded font-semibold  ">
              <i style={this.props.smallIcon ? { fontSize: "18px" } : {}} className={" align-middle material-icons " + (this.props.night ? "text-white" : "")}>{this.props.icon}</i> {this.props.text ? <span className="text-xs font-medium"> {this.props.text}</span> : null}
            </button>
          </div>
          <div onClick={() => this.setState((state) => { return { expand: !state.expand } })}>
            {this.state.expand ?
              <div>{this.props.children}</div>
              :
              ""
            }
          </div>
        </div>
      </div>
    );
  }
}

export default onClickOutside(ContextMenu);

