
import React, { SFC, FunctionComponent } from 'react';

export const OldButton: SFC<{ title: string }> = (props) => (
    <div className="p-2 flex-no-shrink whitespace-no-wrap  rounded  text-xs  font-bold bg-gray-200 uppercase ">{props.title}</div>
)


export const Button: SFC<{ iconColor?: string, title?: string, small?: boolean, button?: boolean, secondary?: boolean, icon?: string, handleOnClick?: () => void, warning?: boolean, primary?: boolean, submit?: boolean, noborder?: boolean }> = (props) => (
    <button type={(props.submit ? "submit" : "button")} onClick={props.handleOnClick}>
        <div className={" flex flex-no-shrink whitespace-no-wrap    font-medium items-center " + (props.small ? " p-1 " : " p-2 ") + (!props.noborder && " border ") + (!props.primary && " text-black  ") + (props.primary && " text-white bg-green-400  border-green-400 ") + (props.secondary && " bg-gray-200  border-gray-200 ") + (props.warning && " border-red-500 text-red-500 font-semibold")}>
            {props.icon && <div className="flex"><i style={{ fontSize: "18px" }} className={"material-icons " + (props.iconColor ? props.iconColor : "")} > {props.icon}</i ></div>}
            <div className="flex ml-1 ">{props.title}</div>
        </div>
    </button>
)

export const CardLayout: FunctionComponent<{ title?: string }> = props => {
    return (
        <div className="p-3 m-2 max-w-2xl bg-white rounded shadow">
            {props.title && <h4>{props.title}</h4>}
            <div className="text-sm pt-1">
                {props.children}
            </div>
        </div>
    )
}