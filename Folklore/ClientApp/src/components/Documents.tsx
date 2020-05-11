import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as WeatherForecastsStore from '../store/WeatherForecasts';
import DocumentApi from '../api/documentsApi';

export default class SearchDocumentPage extends React.Component<any, any> {  
    constructor(props: any, state: any) {
        super(props, state);
        this.state = {documents: []};
    }

    componentWillMount() {
        DocumentApi.getAllDocuments().then(documents => {
            this.setState({documents})
        })
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
        <table className='table table-striped' aria-labelledby="tabelLabel">
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
                <td>{doc.title}</td>
                <td>{doc.content}</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }
  }