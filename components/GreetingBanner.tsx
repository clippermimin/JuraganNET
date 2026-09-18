'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react';

interface GreetingBannerProps {
  ownerName: string;
}

export const GreetingBanner: React.FC<GreetingBannerProps> = ({ ownerName }) => {
  const [time, setTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Set initial time
    setTime(new Date());
    // Update every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hydration safety: render skeleton until mounted
  if (!time) {
    return (
      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
          <div className="h-3 w-32 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-gray-50 rounded-xl w-[90px] h-10 border border-gray-100"></div>
      </div>
    );
  }

  const hour = time.getHours();
  let greeting = '';
  let Icon = Sun;
  let iconColor = 'text-yellow-500';

  if (hour >= 4 && hour < 11) {
    greeting = 'Selamat Pagi';
    Icon = Sunrise;
    iconColor = 'text-amber-500';
  } else if (hour >= 11 && hour < 15) {
    greeting = 'Selamat Siang';
    Icon = Sun;
    iconColor = 'text-yellow-500';
  } else if (hour >= 15 && hour < 18) {
    greeting = 'Selamat Sore';
    Icon = Sunset;
    iconColor = 'text-orange-500';
  } else {
    greeting = 'Selamat Malam';
    Icon = Moon;
    iconColor = 'text-indigo-500';
  }

  // Formatting Date & Time
  const dateStr = time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  // Ensure we get HH.mm.ss format padded with 0
  const timeStr = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.');

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex flex-row items-center justify-between overflow-hidden relative">
      {/* Subtle decorative background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
          <h2 className="text-[13px] font-bold text-gray-800 leading-none">
            {greeting}, Bos <span className="text-blue-600">{ownerName}</span>! 👋
          </h2>
        </div>
        <p className="text-[11px] text-gray-500 font-medium pl-[24px] leading-none">{dateStr}</p>
      </div>
      
      <div className="relative z-10 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex flex-col items-center justify-center min-w-[85px] shadow-inner">
        <div className="flex items-center gap-1 mb-0.5">
          <Clock className="w-3 h-3 text-blue-500" />
          <span className="text-xs font-bold text-slate-700 tracking-wider font-mono">{timeStr}</span>
        </div>
      </div>
    </div>
  );
};
