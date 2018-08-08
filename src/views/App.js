import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home'
import Search from './search'


class App extends Component {
  render() {
    return (
      <Router>
        <div className="play-wrapper">
          <Switch>
            <Route path="/search" component={Search}/>
            <Route path="/home" component={Home}/>
            <Route path="/" component={Home}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
