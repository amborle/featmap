import React, { Component } from 'react';

class NewCard extends Component {
  render() {
    return (
      <div className="p-1 w-36 h-24  border border-dashed border-gray-300 rounded-sm items-center justify-center ">
        <div className="flex h-full">
          {this.props.children}
        </div>
      </div >
    );
  }
}

export default NewCard;
