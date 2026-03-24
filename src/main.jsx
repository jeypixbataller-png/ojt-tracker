import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './utils/i18n.jsx'

// Initialize theme from localStorage (default: light)
const saved = localStorage.getItem('theme')
if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
else document.documentElement.setAttribute('data-theme', 'light')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
)
