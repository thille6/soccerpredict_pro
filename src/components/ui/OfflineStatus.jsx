import React from 'react';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import Icon from '../AppIcon';

/**
 * Komponent som visar offline-status och service worker-uppdateringar
 */
const OfflineStatus = () => {
  const { 
    isOnline, 
    updateAvailable, 
    isInstalling, 
    updateServiceWorker 
  } = useServiceWorker();

  // Visa ingenting om allt är normalt
  if (isOnline && !updateAvailable && !isInstalling) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Offline-status */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2 flex items-center gap-3">
          <Icon name="wifi-off" className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm">Offline-läge</div>
            <div className="text-xs opacity-90">
              Applikationen fungerar med begränsad funktionalitet
            </div>
          </div>
        </div>
      )}

      {/* Service Worker installerar */}
      {isInstalling && (
        <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2 flex items-center gap-3">
          <div className="animate-spin">
            <Icon name="loader" className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Installerar offline-stöd</div>
            <div className="text-xs opacity-90">
              Förbereder appen för offline-användning...
            </div>
          </div>
        </div>
      )}

      {/* Uppdatering tillgänglig */}
      {updateAvailable && (
        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="download" className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">Uppdatering tillgänglig</div>
              <div className="text-xs opacity-90">
                En ny version av appen är redo att installeras
              </div>
            </div>
          </div>
          <button
            onClick={updateServiceWorker}
            className="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-green-50 transition-colors w-full"
          >
            Uppdatera nu
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Enkel offline-indikator för användning i andra komponenter
 */
export const OfflineIndicator = ({ className = '' }) => {
  const { isOnline } = useServiceWorker();

  if (isOnline) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 text-red-600 ${className}`}>
      <Icon name="wifi-off" className="w-4 h-4" />
      <span className="text-sm font-medium">Offline</span>
    </div>
  );
};

/**
 * Offline-banner för att visa i huvudlayouten
 */
export const OfflineBanner = () => {
  const { isOnline } = useServiceWorker();

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <div className="flex items-center">
        <Icon name="alert-triangle" className="w-5 h-5 mr-3 flex-shrink-0" />
        <div>
          <p className="font-medium">Du är offline</p>
          <p className="text-sm">
            Applikationen fungerar med begränsad funktionalitet. 
            Beräkningar och sparade resultat är tillgängliga, men nya data kan inte hämtas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineStatus;