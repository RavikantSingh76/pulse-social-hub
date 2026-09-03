import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-rose-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-lg animate-pulse">
        <WifiOff className="w-4 h-4" />
        <span>You are currently offline. Changes will sync when connectivity returns.</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-lg transition-opacity duration-300">
        <Wifi className="w-4 h-4" />
        <span>Internet connection restored! Syncing updates...</span>
      </div>
    );
  }

  return null;
}
