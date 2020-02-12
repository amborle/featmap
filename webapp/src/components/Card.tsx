import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Color, colorToBorderColorClass } from '../core/misc';

type Props = {
  title: string
  link: string
  status?: string
  small?: boolean
  color?: Color
  rightLink?: () => void
  bottomLink?: () => void
  bottomStatus?: string
};

type State = {};

class Card extends Component<Props, State> {
  render() {

    const color = this.props.color && (this.props.color !== Color.WHITE) ? this.props.color : null

    return (

      <div className={"flex flex-row flex-no-shrink w-32 text-xs bg-white  overflow-hidden border  rounded " + (this.props.small ? " " : " h-16 ") + (color ? " border-l-4 " + colorToBorderColorClass(color) + " " : " " + colorToBorderColorClass(Color.WHITE) + " ")}>

        <div className="flex flex-col flex-grow ">

          <Link className="flex-grow p-1 overflow-hidden " to={this.props.link}>
            <span className={this.props.status === "CLOSED" ? "line-through" : ""}> {this.props.title} </span>
          </Link>
          {this.props.bottomLink &&
            <div className=" flex ml-2  ">
              <div className="font-bold text-lg "><button className=" hover:text-gray-800 text-gray-500" onClick={this.props.bottomLink}>+</button></div>
            </div>
          }
          {this.props.bottomStatus &&
            <div className=" flex p-1 ">
              <div style={{ fontSize: "9px" }}>{this.props.bottomStatus}</div>
            </div>
          }

        </div>
        {this.props.rightLink &&
          <div className="flex items-center p-1">
            <div className="font-bold text-lg "><button className=" hover:text-gray-800 text-gray-500" onClick={this.props.rightLink}>+</button></div>
          </div>
        }


      </div>


    );
  }
}

export default Card;
