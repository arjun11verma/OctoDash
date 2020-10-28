import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'

import Homepage from './Homepage'
import CreateAccount from './CreateAccount'
import Login from './Login';
import InputData from './InputData'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path = "/" component = {Login}/>
        <Route exact path = "/CreateAccount" component = {CreateAccount}/>
        <Route exact path = "/Homepage/:id" component = {Homepage}/>
        <Route exact path = "/InputData/:id" component = {InputData}/>
      </Switch>
    </BrowserRouter>
    );
}

export default App;
