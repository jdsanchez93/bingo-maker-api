import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { Auth0Provider } from '@auth0/auth0-react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="dev-rqtd0acytoaoqh1w.us.auth0.com"
        clientId="GRUCGD2DOK24tGW6gVhuiIGSGZGuLWvg"
        authorizationParams={{
          redirect_uri: window.location.origin
        }}>
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>,
)
