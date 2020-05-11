import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Counter from './components/Counter';
import FetchData from './components/FetchData';
import SearchDocumentPage from "./components/Documents";

import './custom.css'
import DocumentCard from './components/DocumentCard';

export default () => (
    <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
        <Route path='/documents' component={SearchDocumentPage}/>
        <Route path='/document/:documentId' component={DocumentCard}/>
    </Layout>
);
