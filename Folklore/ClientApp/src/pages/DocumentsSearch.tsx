import * as React from 'react';
import DocumentApi from '../api/documentsApi';
import { Table, Button, Col, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import FolkDocument from '../models/Document';

export interface DocumentsSearchProps {
  
}

export interface DocumentsSearchState {
  documents:FolkDocument[],
  loading:boolean,
  search: string
}

export default class DocumentsSearch extends React.Component<DocumentsSearchProps, DocumentsSearchState> {
  constructor(props: DocumentsSearchProps, state: DocumentsSearchState) {
    super(props, state);
    this.state = { documents: [], loading:false, search:'' };
  }

  componentWillMount() {
    this.setState({loading:true});
    DocumentApi.getAllDocuments().then(documents => {
      this.setState({ documents, loading:false });
    });
  }

  public render() {
    return (
      <React.Fragment>
        {this.renderDocuments()}
      </React.Fragment>
    );
  }

  async searchDocuments() {
    let { search } = this.state;

    this.setState({documents: await DocumentApi.searchDocuments(search)});
    

  }

  private renderDocuments() {
    const { loading,search } = this.state;
    if (loading){
      return <Loader/>
    }
    return (
      <>
      <br />
      <Col sm={2}>
        <Input type="text" value={search} onChange={e => this.setState({ search: e.target.value })}/>
      </Col>
      <Col sm={{ size: 2, offset: 10 }}>
        <Button outline color="primary" style={{ width: "100%" }} onClick={() => this.searchDocuments()}>Поиск</Button>
      </Col>
      <br />
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
      </>
    );
  }
}