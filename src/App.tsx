import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './home';
import Page from './page';
import Stats from './stats';
import Login from './views/auth/login';
import { AuthProvider } from './context/auth';
import Navbar from './components/navbar';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import AuthenticatedRoute from './routes/authenticated';
import { Toaster } from 'react-hot-toast';
import './index.scss';


const RootProviders = ({ children }) => (
  <Router>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </Router>
);


const App = () => {
  return (
    <>
      <RootProviders>
        <div className='App'>
        <Toaster position='bottom-right' />
          <Navbar />
          <div className="page-wrapper">
            <Switch>
              <AuthenticatedRoute path="/" exact component={Home} />
              <AuthenticatedRoute path="/page" component={Page} />
              <AuthenticatedRoute path="/stats" component={Stats} />
              <Route path="/login" component={Login} />
              {/* <Route path="/register" component={Register} /> */}
            </Switch>
          </div>
        </div>
      </RootProviders>
    </>
  );
}

export default App;
