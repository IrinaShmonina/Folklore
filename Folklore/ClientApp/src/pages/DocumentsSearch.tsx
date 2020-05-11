import * as React from 'react';
import DocumentApi from '../api/documentsApi';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';

export default class DocumentsSearch extends React.Component<any, any> {
  constructor(props: any, state: any) {
    super(props, state);
    this.state = { documents: [] };
  }

  componentWillMount() {
    DocumentApi.getAllDocuments().then(documents => {
      this.setState({ documents });
    });
  }

  public render() {
    return (
      <React.Fragment>
        {this.renderDocuments()}
      </React.Fragment>
    );
  }

  private renderDocuments() {
    return (
      <Table hover>
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Content</th>
          </tr>
        </thead>
        <tbody>
          {this.state.documents.map((doc: any) =>
            <tr key={doc.id}>
              <td>{doc.id}</td>
              <td><Link to={`/document/view/${doc.id}`}>{doc.title}</Link></td>
              <td>{doc.content}</td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  }
}