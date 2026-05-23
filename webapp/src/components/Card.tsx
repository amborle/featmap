import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Color, colorToBorderColorClass, dbAnnotationsFromNames } from '../core/misc';

type Props = {
  title: string
  link: string
  status?: string
  small?: boolean
  color?: Color
  bottomLink?: () => void
  nbrOfItems?: number
  nbrOfComments?: number
  annotations: string
  estimate?: number
  hasDescription?: boolean
};

type State = {};

class Card extends Component<Props, State> {

  render() {

    const annos = dbAnnotationsFromNames(this.props.annotations)

    const color = this.props.color && (this.props.color !== Color.WHITE) ? this.props.color : null

    const title = this.props.title

    return (
      <div>
        <div style={{ fontSize: '12px' }} className={"flex flex-row flex-no-shrink w-36 rounded-sm   bg-white  overflow-hidden border   " + (this.props.small ? " " : " h-24 ") + (color ? " border-l-4 " + colorToBorderColorClass(color) + " " : " " + colorToBorderColorClass(Color.WHITE) + " ")}>

          <Link className="flex flex-col flex-grow" to={this.props.link}>


            <div className="flex-grow p-2 font-normal     overflow-hidden ">
              <span className={this.props.status === "CLOSED" ? "line-through" : ""}> {title} </span>
            </div>


            <div className=" flex p-2 flex-row">
              {this.props.nbrOfItems && !(this.props.nbrOfItems === 0) ?
                <div className=" flex ">
                  <div>{this.props.nbrOfItems} items</div>
                </div>
                :
                null
              }

              {this.props.hasDescription ?
                  <div>
                    <i style={{ fontSize: "12px" }} title="description" className="material-icons align-middle">notes</i>
                  </div>
                  :
                  null
              }

              {this.props.nbrOfComments! > 0 ?
                <div title={this.props.nbrOfComments + " comments"} className="whitespace-nowrap " >
                  {this.props.nbrOfComments!}<i style={{ fontSize: "12px" }} className="material-icons align-middle">chat_bubble_outline </i>
                </div>

                :
                null
              }
              <div className="flex flex-grow"></div>

              {this.props.annotations ?
                annos.annotations.map((a, i) => {
                  return <div className="bg-gray-200" key={i}> <i style={{ fontSize: "14px" }} title={a.description} className=" text-gray-700 material-icons align-middle">{a.icon}</i></div>
                })
                :
                null
              }

              {this.props.estimate && !(this.props.estimate === 0) ?
                <div className="whitespace-nowrap bg-gray-200 px-1 " >
                  <span title={"Size is " + this.props.estimate}> {this.props.estimate}</span>
                </div>
                :
                null
              }

            </div>

          </Link>


        </div>
        {this.props.bottomLink &&
          <div className=" flex w-36 h-6  flex-no-shrink -mt-1 -mb-2  justify-center">
            <div className="flex showme font-bold text-xl   "><button className=" hover:text-gray-800 text-gray-500" onClick={this.props.bottomLink}>+</button></div>
          </div>
        }

      </div>

    );
  }
}

export default Card;
