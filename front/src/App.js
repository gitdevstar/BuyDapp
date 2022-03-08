import React, {Fragment} from 'react';
import { BrowserRouter } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';

import MainRoutes from './routes/MainRoutes';
import {AppContainer} from './container/AppContainer'

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <BrowserRouter >
          <Fragment>
              <AppContainer>
                <MainRoutes />
              </AppContainer>
            </Fragment>
        </BrowserRouter>
    );
  }
}

export default App;