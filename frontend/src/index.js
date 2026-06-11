import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import {
  Auth,
  Monitor,
  Management,
  Profile,
  Project,
  Finance,
  Customer,
  Director,
  Humen,
  Manpower,
} from './layouts';
import configureStore from './redux/configureStore';
// import Home from '../iews/Home';

import PrivateRoute from './contexts/PrivateRoute';
import AuthProvider from './contexts/AuthContext';
import SocketProvider from './contexts/SocketContext';
import theme from './theme';
import { NotFound } from './components/Error';

import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/styles/index.css';
import Home from './views/Home';

const store = configureStore();

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider theme={theme}>
            <div className="bg-gray-100">
              <Switch>
                <Route path="/auth" component={Auth} />
                <Route path="/manpower" component={Manpower} />
                <PrivateRoute>
                  <Route exact path="/" component={Home} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/management" component={Management} />
                  <Route path="/monitor" component={Monitor} />
                  <Route path="/project" component={Project} />
                  <Route path="/finance" component={Finance} />
                  <Route path="/customer" component={Customer} />
                  <Route path="/director" component={Director} />
                  <Route path="/humen" component={Humen} />
                  <Route path="/sale" component={Humen} />
                </PrivateRoute>
                <Redirect from="*" to="/auth" />
              </Switch>
            </div>
          </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  </Router>,
  document.getElementById('root'),
);

