// src/main.jsx
// ----------------------------------------------------------------------------
// Entry point. Mounts <App /> into the DOM and pulls in global Tailwind CSS.
// ----------------------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
