import React from 'react'
import ReactDOM from 'react-dom/client'

// Bootstrap CSS + bundled JS (Offcanvas, Dropdown, Collapse, etc.)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Glondia design tokens and dashboard styles (applied on top of Bootstrap)
import './styles/bootstrap-overrides.css'
import './styles/globals.css'
import './styles/dashboard.css'
import './styles/public.css'

import App from './app/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
