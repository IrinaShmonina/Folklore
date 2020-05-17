import React from "react";
import { Spinner } from "reactstrap";

export default class Loader extends React.Component{
    render(){
        return <div style={{position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
            <Spinner color="primary" />
        </div>;
    }
}