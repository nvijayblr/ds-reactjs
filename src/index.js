import 'core-js/fn/string/ends-with';
import 'core-js/fn/string/starts-with';
import 'core-js/fn/array/includes';
import 'core-js/fn/array/find';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
// import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
