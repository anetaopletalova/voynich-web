import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Home from './home';
import Page from './page';
import Stats from './stats';
import Login from './views/auth/login';
import { AuthProvider } from './context/auth';

const RootProviders = ({ children }) => (
  <Router>
    <AuthProvider>
      {children}
    </AuthProvider>
  </Router>
);


const App = () => {
  return (
    <>
      <RootProviders>
        <Link to="/stats">Stats</Link>
        <Link to="/">Home</Link>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/page" component={Page} />
          <Route path="/stats" component={Stats} />
          <Route path="/login" component={Login} />
          {/* <Route path="/register" component={Register} /> */}
        </Switch>
      </RootProviders>
    </>
  );
}

export default App;
