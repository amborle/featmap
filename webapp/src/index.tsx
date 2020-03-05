import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker';
import configureStore, { history } from './configureStore'
import { Router } from 'react-router-dom'

const store = configureStore()

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <App application={{workspaces:[], memberships:[], messages:[], subscriptions:[]} } />
        </Router>
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
