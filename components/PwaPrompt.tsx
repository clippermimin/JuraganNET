'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';

export const PwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show prompt for iOS if visited before and not dismissed
    const dismissed = sessionStorage.getItem('pwa_dismissed');
    if (isIosDevice && !dismissed) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-slideDown">
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 text-white relative">
          <Smartphone className="w-7 h-7" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Download className="w-3 h-3 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-bold text-slate-900 text-[15px] leading-tight mb-1">
            JuraganNet App
          </h4>
          <p className="text-[13px] text-slate-500 leading-snug">
            {isIos ? (
              <span className="flex items-center flex-wrap gap-x-1">
                Tap <Share className="w-3.5 h-3.5 text-blue-500 inline" /> lalu 
                <span className="font-semibold text-slate-700">"Add to Home Screen"</span>
              </span>
            ) : (
              "Akses lebih cepat & mudah"
            )}
          </p>

          {!isIos && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              type="button"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] px-4 py-1.5 rounded-full transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              Install
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
