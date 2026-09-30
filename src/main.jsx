import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from '@/App.jsx'
import '@/index.css'
import { buildSentryOptions } from '@/lib/sentryConfig'

// Unregister any stale service worker (e.g. from an App Store build that had a PWA SW).
// In Capacitor WKWebView, service workers can't fetch from the capacitor:// scheme in the SW thread,
// so any previously-registered SW silently breaks all audio file loads.
if ('serviceWorker' in navigator && window.Capacitor) {
  navigator.serviceWorker.getRegistrations().then(regs =>
    regs.forEach(r => r.unregister())
  );
}

// Error capture only, scrubbed for a child-directed app (CR-59): see sentryConfig.js
Sentry.init(buildSentryOptions({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: `soundfind@${__APP_VERSION__}`, // CR-65: from package.json via vite define
}))

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
