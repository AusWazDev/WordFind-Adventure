import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from '@/App.jsx'
import '@/index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: 'soundfind@1.0.0',
  sendDefaultPii: false,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 0.1,
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
