import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import FolkDocument from '../models/Document';
import DocumentCard from '../components/DocumentCard';
import DocumentApi from '../api/documentsApi';
import Loader from '../components/Loader';

type DocumentViewProps = RouteComponentProps<{ id: string; }>;;

interface DocumentViewState {
  doc?: FolkDocument;
  loading: boolean;
}

export default class DocumentView extends React.Component<DocumentViewProps, DocumentViewState> {
  constructor(props: DocumentViewProps, state: DocumentViewState) {
    super(props, state);
    this.state = { loading: false };
  }
  async componentWillMount() {
    const id = parseInt(this.props.match.params.id, 10);
    if (!id) {
      return;
    }

    var doc = await DocumentApi.getDocument(id);
    this.setState({ doc });
  }

  async saveDoc(doc: FolkDocument) {
    this.setState({ loading: true })
    doc = await DocumentApi.updateDocument(doc);
    this.setState({ doc, loading:false });
  }

  render() {
    const { doc, loading } = this.state;
    if (!doc || loading) {
      return <Loader />
    }

    return <DocumentCard doc={doc} editing={false} onDocSave={async doc => await this.saveDoc(doc)} />;
  }
}