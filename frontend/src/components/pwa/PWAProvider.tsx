import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface PWAContextType {
  isInstallable: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  installPWA: () => void;
  updatePWA: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Install PWA function - defined first to avoid reference errors
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      const { outcome } = await result.userChoice;

      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('PWA installation error:', error);
      toast.error(t('errors.generic'));
    }
  }, [deferredPrompt, t]);

  // Update PWA function - defined before being referenced
  const updatePWA = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  // Handle PWA installation
  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setIsInstallable(true);

    // Show install prompt after 30 seconds
    setTimeout(() => {
      if (isInstallable && !localStorage.getItem('pwa-installed')) {
        toast.info(t('pwa.installPrompt'), {
          description: t('pwa.installDescription'),
          action: {
            label: t('pwa.install'),
            onClick: () => installPWA(),
          },
        });
      }
    }, 30000);
  }, [isInstallable, t, installPWA]);

  const handleAppInstalled = useCallback(() => {
    setIsInstallable(false);
    setDeferredPrompt(null);
    localStorage.setItem('pwa-installed', 'true');

    toast.success(t('pwa.installedSuccess'), {
      description: t('pwa.installedDescription'),
    });
  }, [t]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [handleBeforeInstallPrompt, handleAppInstalled]);

  // Handle online/offline status
  const handleOnline = useCallback(() => {
    setIsOffline(false);
    toast.success(t('pwa.connectionRestored'));
  }, [t]);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    toast.warning(t('pwa.offlineMode'), {
      description: t('pwa.offlineDescription'),
    });
  }, [t]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Register service worker (only in production to avoid interfering with Vite dev server/HMR)
  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          setRegistration(registration);
          console.log('Service Worker registered successfully');
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Check for updates
  useEffect(() => {
    if (!registration) return;

    const checkForUpdates = () => {
      registration.update().then(() => {
        if (registration.installing) {
          setUpdateAvailable(true);
        }
      });
    };

    // Check for updates every hour
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

    // Listen for updates
    const handleUpdateFound = () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);

            toast.info(t('pwa.updateAvailable'), {
              description: t('pwa.updateDescription'),
              action: {
                label: t('pwa.update'),
                onClick: () => updatePWA(),
              },
            });
          }
        });
      }
    };

    registration.addEventListener('updatefound', handleUpdateFound);

    return () => {
      clearInterval(interval);
      registration.removeEventListener('updatefound', handleUpdateFound);
    };
  }, [registration, t, updatePWA]);

  const value: PWAContextType = {
    isInstallable,
    isOffline,
    updateAvailable,
    installPWA,
    updatePWA,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};