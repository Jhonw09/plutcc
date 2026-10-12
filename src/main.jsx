import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CookieConsentProvider } from './context/CookieConsentContext.jsx'
import CookieBanner from './components/ui/CookieBanner.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CookieConsentProvider>
        <AuthProvider>
          <App />
          <CookieBanner />
        </AuthProvider>
      </CookieConsentProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
