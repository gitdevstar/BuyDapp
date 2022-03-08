import React, {Fragment} from 'react';

import PagesRoutes from '../routes/PagesRoutes';
import {AppContainer} from './AppContainer'

class Pages extends React.Component {
  constructor(props) {
    super(props);
  }

    render() {
        return (
        <Fragment>
            <AppContainer>
                <PagesRoutes />
            </AppContainer>
        </Fragment> 
        );
    }
}

export default Pages;