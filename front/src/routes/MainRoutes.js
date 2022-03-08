import React from "react";
import { Route, Switch } from "react-router-dom";

import BuyPage from '../container/BuyPage';
import EmptyPage from '../container/404';

export default function MainRoutes() {
  return (
    
        <Switch>
          <Route exact path="/" component={BuyPage} />
          <Route path="/404" component={EmptyPage} />
        </Switch>
      
  );
}