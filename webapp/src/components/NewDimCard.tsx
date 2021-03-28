import React, { Component } from 'react';

class NewDimCard extends Component {
  render() {
    return (
      <div className="flex p-1 w-36 h-24  border border-dashed border-gray-200 rounded items-center justify-center ">
        <div className="flex">
          {this.props.children}
        </div>
      </div >
    );
  }
}

export default NewDimCard;
