import * as React from 'react';
import { Route, Switch } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import DocumentView from './pages/DocumentView';
import DocumentsSearch from './pages/DocumentsSearch';
import DocumentCreation from './pages/DocumentCreation';

import './custom.css';

export default () => (
  <Layout>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route exact path='/documents' component={DocumentsSearch} />
      <Route exact path='/document/view/:id/' component={DocumentView} />
      <Route exact path='/document/creation' component={DocumentCreation} />
    </Switch>
  </Layout>
);
