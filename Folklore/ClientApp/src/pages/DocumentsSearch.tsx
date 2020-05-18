import * as React from 'react';
import DocumentApi from '../api/documentsApi';
import { Table, Button, Col, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import FolkDocument from '../models/Document';
import { InputRow } from '../components/InputRow';
import { Genre } from '../models/Genre';
import {Typeahead, AsyncTypeahead} from 'react-bootstrap-typeahead';
import { Informant } from '../models/Informant';

export interface DocumentsSearchProps {
  
}

export interface DocumentsSearchState {
  documents:FolkDocument[],
  loading:boolean,
  search: string,
  genre:string,
  genres: Genre[],
  searchLoading: boolean,
  place: string,
  yearOfRecord: string,
  informants: Informant[],
  informant: string
}

export default class DocumentsSearch extends React.Component<DocumentsSearchProps, DocumentsSearchState> {
  constructor(props: DocumentsSearchProps, state: DocumentsSearchState) {
    super(props, state);
    this.state = { documents: [], loading:false, search:'',genre:'',genres:[], searchLoading:false, place:'', yearOfRecord:'',informants:[], informant:'' };
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
    let { search,genre,place,yearOfRecord,informant,loading } = this.state;
    this.setState({documents: await DocumentApi.searchDocuments(search,genre,place,yearOfRecord,informant)});
    

  }

  async searchGenres(q:string){
    this.setState({searchLoading:true})
    this.setState({genres: await DocumentApi.searchGenres(q)})
    this.setState({searchLoading:false})
  }
  async searchInformants(q:string){
    this.setState({searchLoading:true})
    this.setState({informants: await DocumentApi.searchInformants(q)})
    this.setState({searchLoading:false})
  }

  private renderDocuments() {
    const { loading,search,genre,genres, searchLoading, place,yearOfRecord,informants,informant } = this.state;
    
    if (loading){
      return <Loader/>
    }
    return (
      <>
      <br />
      <InputRow>
      <Col sm={2}>
        <Input type="text" placeholder="Тескт содержит" value={search} onChange={e => this.setState({ search: e.target.value })}/>
      </Col>
      <Col sm={2}>
        <AsyncTypeahead
        id="labelkey-example"
        onSearch={(q) => this.searchGenres(q)}
        isLoading={searchLoading}
        minLength={3}
        options={genres.map((genre) => genre.genreName)}
        placeholder="Жанр"
        onInputChange={e => this.setState({ genre: e })}
        onChange={e => this.setState({ genre: e[0] })}
      /></Col>
      <Col sm={2}>
      <Input type="text" placeholder="Место сбора" value={place} onChange={e => this.setState({ place: e.target.value })}/>
      </Col>
      <Col sm={2}>
        <Input type="number" placeholder="Год экспедиции" value={yearOfRecord} onChange={e => this.setState({ yearOfRecord: e.target.value })}/>
      </Col>
      <Col sm={2}>
        <AsyncTypeahead
        id="labelkey-example"
        onSearch={(q) => this.searchInformants(q)}
        isLoading={searchLoading}
        minLength={3}
        options={informants.map((Informant) => Informant.fio)}
        placeholder="Информант"
        onInputChange={e => this.setState({ informant: e })}
        onChange={e => this.setState({ informant: e[0] })}
      /></Col>
      <Col sm={2}>
        <Button outline color="primary" style={{ width: "100%" }} onClick={() => this.searchDocuments()}>Поиск</Button>
      </Col>
      </InputRow>
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