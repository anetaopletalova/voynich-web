import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Home from './home';
import Page from './page';
import Stats from './stats';

const App = () => {
  return (
    <>
      <Router>
        <Link to="/stats">Stats</Link>
        <Link to="/">Home</Link>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/page" component={Page} />
          <Route path="/stats" component={Stats} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
