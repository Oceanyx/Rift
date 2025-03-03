import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/styles.css';
import { Provider } from 'react-redux';
import configureStore from './store/index';
import { SocketProvider } from './context/SocketContext';

const store = configureStore();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </Provider>
  </React.StrictMode>
);
