import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'

import Homepage from './Homepage'
import CreateAccount from './CreateAccount'
import Login from './Login';
import LineGraph from './LineGraph';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path = "/" component = {Login}/>
        <Route exact path = "/CreateAccount" component = {CreateAccount}/>
        <Route exact path = "/Homepage" component = {Homepage}/>
        <Route exact path = "/LineGraph" component = {LineGraph}/>
      </Switch>
    </BrowserRouter>
    );
}

export default App;
