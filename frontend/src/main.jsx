// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { Provider } from 'react-redux';
import configureStore from './store';
import { restoreCSRF, csrfFetch } from './utils/csrf';
import * as sessionActions from './store/session';
import { BrowserRouter } from 'react-router-dom';

const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  window.store = store;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

if (import.meta.env.MODE !== 'production') {
  restoreCSRF();
  window.csrfFetch = csrfFetch;
  window.store = store;
  window.sessionActions = sessionActions;
}
