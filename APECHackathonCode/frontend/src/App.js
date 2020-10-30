import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'

import Homepage from './Homepage'
import CreateAccount from './CreateAccount'
import Login from './Login';
<<<<<<< Updated upstream
import InputData from './InputData'
=======
import LineGraph from './LineGraph';
import PrettyUrl from './PrettyUrl';
>>>>>>> Stashed changes

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path = "/" component = {Login}/>
        <Route exact path = "/CreateAccount" component = {CreateAccount}/>
<<<<<<< Updated upstream
        <Route exact path = "/Homepage/:id" component = {Homepage}/>
        <Route exact path = "/InputData/:id" component = {InputData}/>
=======
        <Route exact path = "/Homepage" component = {Homepage}/>
        <Route exact path = "/LineGraph" component = {LineGraph}/>
        <Route exact path = "/PrettyUrl" component = {PrettyUrl}/>
>>>>>>> Stashed changes
      </Switch>
    </BrowserRouter>
    );
}

export default App;
