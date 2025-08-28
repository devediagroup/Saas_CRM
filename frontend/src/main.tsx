import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PWAProvider } from './components/pwa/PWAProvider'
import { LanguageProvider } from './components/providers/LanguageProvider'
import { reportWebVitals, preloadCriticalResources } from './lib/performance'
import './lib/i18n'
import './index.css'

// In dev, unregister any existing service workers to avoid caching interference with Vite/HMR
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  if (window.caches && typeof caches.keys === 'function') {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}

// Preload critical resources
preloadCriticalResources();

// Performance monitoring - Web Vitals temporarily disabled due to compatibility issues
// TODO: Re-enable Web Vitals monitoring after fixing compatibility with current version
if (process.env.NODE_ENV === 'production') {
  // Web Vitals monitoring will be re-enabled in future update
  console.log('Web Vitals monitoring ready for future implementation');
}

createRoot(document.getElementById("root")!).render(
  <PWAProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </PWAProvider>
);
