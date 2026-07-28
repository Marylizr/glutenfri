import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/index.jsx'
import OfflineNotice from './components/OfflineNotice.jsx'
import { registerServiceWorker } from './serviceWorker.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
        <OfflineNotice />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)

registerServiceWorker()
