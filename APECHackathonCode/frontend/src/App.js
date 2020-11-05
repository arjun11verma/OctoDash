import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'

import Homepage from './Homepage'
import CreateAccount from './CreateAccount'
import Login from './Login';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path = "/" component = {Login}/>
        <Route exact path = "/CreateAccount" component = {CreateAccount}/>
        <Route exact path = "/Homepage/:id" component = {Homepage}/>
      </Switch>
    </BrowserRouter>
    );
}

export default App;
