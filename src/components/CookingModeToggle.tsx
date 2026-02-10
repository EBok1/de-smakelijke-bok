'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export default function CookingModeToggle() {
  const t = useTranslations('cookingMode');
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  // Define requestWakeLock first (before the useEffect that uses it)
  const requestWakeLock = useCallback(async () => {
    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      
      lock.addEventListener('release', () => {
        setWakeLock(null);
      });
      
      return true;
    } catch (err) {
      console.error('Wake Lock error:', err);
      return false;
    }
  }, []);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLock) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isActive, wakeLock, requestWakeLock]);

  const toggleCookingMode = async () => {
    if (isActive) {
      // Turn off cooking mode
      if (wakeLock) {
        await wakeLock.release();
        setWakeLock(null);
      }
      setIsActive(false);
    } else {
      // Turn on cooking mode
      const success = await requestWakeLock();
      if (success) {
        setIsActive(true);
      }
    }
  };

  // Don't render if Wake Lock is not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggleCookingMode}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300
          ${isActive 
            ? 'bg-sage text-white shadow-md' 
            : 'bg-cream-dark text-brown hover:bg-sage-light'
          }
        `}
        title={isActive ? t('turnOff') : t('turnOn')}
      >
        <CookingIcon isActive={isActive} />
        <span className="text-sm">
          {t('label')}
        </span>
        <span className={`
          w-2 h-2 rounded-full transition-colors duration-300
          ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}
        `} />
      </button>
      <span className="text-xs text-brown-light">
        {t('hint')}
      </span>
    </div>
  );
}

function CookingIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
    >
      {/* Pot/pan icon */}
      <path d="M3 11h18" />
      <path d="M5 11v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      <path d="M12 11V5" />
      <path d="M9 8c0-2 1-3 3-3s3 1 3 3" />
      {/* Steam lines when active */}
      {isActive && (
        <>
          <path d="M8 2v2" className="animate-pulse" />
          <path d="M12 1v2" className="animate-pulse" />
          <path d="M16 2v2" className="animate-pulse" />
        </>
      )}
    </svg>
  );
}
