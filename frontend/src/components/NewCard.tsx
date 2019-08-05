import React, { Component } from 'react';

class NewCard extends Component {
  render() {
    return (
      <div className="p-1 w-32 h-16  border border-dashed border-gray-800 rounded items-center justify-center ">
        <div className="flex h-full">
          {this.props.children}
        </div>
      </div >
    );
  }
}

export default NewCard;
