import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home'

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/home" component={Home}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
