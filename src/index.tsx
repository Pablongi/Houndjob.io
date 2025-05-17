import React from 'react';
import ReactDOM from 'react-dom/client'; // Changed from react-dom
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);