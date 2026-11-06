import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/mathlive'; // registers the <math-field> formula editor
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
