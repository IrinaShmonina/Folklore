import * as React from 'react';
import { Row } from 'reactstrap';

export class InputRow extends React.Component {
  render() {
    return (<div style={{ marginBottom: "10px" }}>
      <Row>
        {this.props.children}
      </Row>
    </div>);
  }
}
