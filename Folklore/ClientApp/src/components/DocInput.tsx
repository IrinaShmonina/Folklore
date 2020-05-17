import * as React from 'react';
import { Col, Label, InputGroup } from 'reactstrap';

export interface DocInputProps {
    label: string;
    visible?: boolean;
  }

export class DocInput extends React.Component<DocInputProps> {
  render() {
    let { label, visible } = this.props;
    if (visible === undefined) {
      visible = true;
    }
    if (visible) {
      return (<InputGroup style={{ marginBottom: "20px" }}>
      <Col sm={2}>
        <Label>{label}</Label>
      </Col>
      <Col sm={10}>
        {this.props.children}
      </Col>
    </InputGroup>);
    }
    return <></>;
  }
}
