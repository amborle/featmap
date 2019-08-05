import React, { Component } from 'react';
import onClickOutside from "react-onclickoutside";

interface Props {
  icon: string
  night?: boolean
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
      <div>
        <div className="relative">
          <div className="flex items-center ">
            <button onClick={() => this.setState((state) => { return { expand: !state.expand } })} className="flex text-sm p-1 rounded font-semibold ">
              <i className={"material-icons " + (this.props.night ? "text-white" : "")}>{this.props.icon}</i>
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

