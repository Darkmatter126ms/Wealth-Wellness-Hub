import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n'   // initialise i18next before any component mounts

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
