import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './views/auth/login';
import { AuthProvider } from './context/auth';
import Navbar from './components/navbar';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import AuthenticatedRoute from './routes/authenticated';
import { Toaster } from 'react-hot-toast';
import './index.scss';
import Home from './views/home';
import Page from './views/pages/page';
import MyList from './views/myList';
import PasswordChange from './views/auth/passwordChange';
import { LookupProvider } from './context/data';

const RootProviders = ({ children }) => (
  <Router>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <LookupProvider>
          {children}
        </LookupProvider>
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
              <Route path="/login" component={Login} /> 
              <AuthenticatedRoute path="/page/:pageId" component={Page} />
              <AuthenticatedRoute path="/myList" component={MyList} />
              <AuthenticatedRoute path="/passwordchange" component={PasswordChange} />
              <AuthenticatedRoute path="/" exact component={Home} />              
            </Switch>
          </div>
        </div>
      </RootProviders>
    </>
  );
}

export default App;
