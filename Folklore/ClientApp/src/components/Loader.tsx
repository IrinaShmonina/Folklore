import React from "react";
import { Spinner } from "reactstrap";

import './index.css';

export default class Loader extends React.Component {
  render() {
    return (
      <div className="spinner-background">
        <div className="spinner" >
          <Spinner color="primary" />
        </div>
      </div>
    );
  }
}