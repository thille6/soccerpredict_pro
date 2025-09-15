import { useState, useEffect } from 'react';

/**
 * Hook för att hantera service worker och offline-funktionalitet
 */
export const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Registrera service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  // Lyssna på online/offline-händelser
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App: Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('App: Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      setIsInstalling(true);
      // Använd import.meta.env.BASE_URL för att få rätt base path för GitHub Pages
      const swPath = `${import.meta.env.BASE_URL}sw.js`;
      const registration = await navigator.serviceWorker.register(swPath);
      setSwRegistration(registration);
      console.log('Service Worker: Registered successfully', registration);

      // Lyssna på uppdateringar
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              console.log('Service Worker: Update available');
            }
          });
        }
      });

      // Kontrollera om det redan finns en uppdatering
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

    } catch (error) {
      console.error('Service Worker: Registration failed', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      
      // Ladda om sidan efter en kort fördröjning
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const unregisterServiceWorker = async () => {
    if (swRegistration) {
      try {
        await swRegistration.unregister();
        setSwRegistration(null);
        console.log('Service Worker: Unregistered successfully');
      } catch (error) {
        console.error('Service Worker: Unregistration failed', error);
      }
    }
  };

  return {
    isOnline,
    swRegistration,
    updateAvailable,
    isInstalling,
    updateServiceWorker,
    unregisterServiceWorker,
    registerServiceWorker
  };
};

/**
 * Hook för att hantera offline-data och caching
 */
export const useOfflineData = () => {
  const [offlineData, setOfflineData] = useState(null);
  const [isLoadingOfflineData, setIsLoadingOfflineData] = useState(false);

  // Spara data för offline-användning
  const saveOfflineData = async (key, data) => {
    try {
      const dataToStore = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(`offline_${key}`, JSON.stringify(dataToStore));
      console.log(`Offline data saved for key: ${key}`);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  // Ladda offline-data
  const loadOfflineData = async (key) => {
    try {
      setIsLoadingOfflineData(true);
      const storedData = localStorage.getItem(`offline_${key}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setOfflineData(parsedData.data);
        return parsedData.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    } finally {
      setIsLoadingOfflineData(false);
    }
  };

  // Rensa offline-data
  const clearOfflineData = (key) => {
    try {
      if (key) {
        localStorage.removeItem(`offline_${key}`);
      } else {
        // Rensa all offline-data
        Object.keys(localStorage)
          .filter(k => k.startsWith('offline_'))
          .forEach(k => localStorage.removeItem(k));
      }
      setOfflineData(null);
      console.log('Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };

  return {
    offlineData,
    isLoadingOfflineData,
    saveOfflineData,
    loadOfflineData,
    clearOfflineData
  };
};

export default useServiceWorker;