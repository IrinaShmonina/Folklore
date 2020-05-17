import * as React from 'react';
import DocumentCard from '../components/DocumentCard';
import FolkDocument, { createEmptyDoc } from '../models/Document';
import DocumentApi from '../api/documentsApi';
import { RouteComponentProps, Redirect } from "react-router";
import Loader from '../components/Loader';


type DocumentCreationProps = RouteComponentProps
interface DocumentCreationState {
  savedDocId?: number;
  loading: boolean;
}

export default class DocumentCreation extends React.Component<DocumentCreationProps, DocumentCreationState> {
  constructor(props: DocumentCreationProps, state: DocumentCreationState) {
    super(props, state);
    this.state = { loading: false }
  }

  async saveDoc(doc: FolkDocument) {
    this.setState({ loading: true })
    doc = await DocumentApi.addDocument(doc);
    this.setState({
      savedDocId: doc.id
    })
  }

  render() {
    let { savedDocId, loading } = this.state;
    if (savedDocId) {
      return <Redirect to={`/document/view/${savedDocId}`} />
    }
    if (loading) {
      return <Loader />
    }

    let doc = createEmptyDoc();
    return <DocumentCard doc={doc} editing={true} onDocSave={async doc => await this.saveDoc(doc)} />
  }
}