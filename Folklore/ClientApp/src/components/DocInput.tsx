import * as React from 'react';
import { Col, Label, InputGroup } from 'reactstrap';

export interface DocInputProps {
    label: string;
  }

export class DocInput extends React.Component<DocInputProps> {
  render() {
    const { label } = this.props;
    return (<InputGroup style={{ marginBottom: "20px" }}>
      <Col sm={2}>
        <Label>{label}</Label>
      </Col>
      <Col sm={10}>
        {this.props.children}
      </Col>
    </InputGroup>);
  }
}
