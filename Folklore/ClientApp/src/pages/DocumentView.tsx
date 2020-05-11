import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import FolkDocument from '../models/Document';
import DocumentCard from '../components/DocumentCard';
import DocumentApi from '../api/documentsApi';

type DocumentViewProps = RouteComponentProps<{ id: string; }>;;

interface DocumentViewState {
  doc?: FolkDocument;
}

export default class DocumentView extends React.Component<DocumentViewProps, DocumentViewState> {
  constructor(props: DocumentViewProps, state: DocumentViewState) {
    super(props, state);
    this.state = {};
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
    doc = await DocumentApi.updateDocument(doc);
    this.setState({ doc });
  }

  render() {
    const { doc } = this.state;
    if (!doc) {
      return <div>Загружаем документ...</div>;
    }

    return <DocumentCard doc={doc} editing={false} onDocSave={async doc => await this.saveDoc(doc)} />;
  }
}