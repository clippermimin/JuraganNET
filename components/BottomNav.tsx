'use client';

import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  LayoutDashboard, 
  Users, 
  Settings 
} from 'lucide-react';
import { TransactionType } from '@/lib/types';

interface BottomNavProps {
  currentTab: 'DASHBOARD' | 'CUSTOMERS' | 'SETTINGS';
  onSelectTab: (tab: 'DASHBOARD' | 'CUSTOMERS' | 'SETTINGS') => void;
  onOpenTransaction: (type: TransactionType) => void;
  unpaidCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenTransaction,
  unpaidCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto px-3 pt-2.5 pb-3 space-y-2">
        
        {/* Two Huge Side-by-Side Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* UANG MASUK (Green) */}
          <button
            onClick={() => onOpenTransaction('IN')}
            type="button"
            className="min-h-[50px] px-3 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition active:scale-[0.97] cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            </div>
            <span>+ UANG MASUK</span>
          </button>

          {/* UANG KELUAR (Rose/Red) */}
          <button
            onClick={() => onOpenTransaction('OUT')}
            type="button"
            className="min-h-[50px] px-3 py-2.5 rounded-2xl bg-white border-2 border-red-500 hover:bg-red-50 active:bg-red-100 text-red-600 font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.97] cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </div>
            <span>- UANG KELUAR</span>
          </button>
        </div>

        {/* Bottom Tab Bar Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-200">
          {/* Dashboard Tab */}
          <button
            onClick={() => onSelectTab('DASHBOARD')}
            type="button"
            className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              currentTab === 'DASHBOARD'
                ? 'bg-white text-blue-600 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[11px] leading-none">Ringkasan</span>
          </button>

          {/* Customers Tab */}
          <button
            onClick={() => onSelectTab('CUSTOMERS')}
            type="button"
            className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 relative ${
              currentTab === 'CUSTOMERS'
                ? 'bg-white text-blue-600 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[11px] leading-none">Pelanggan</span>
            {unpaidCount > 0 && (
              <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => onSelectTab('SETTINGS')}
            type="button"
            className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              currentTab === 'SETTINGS'
                ? 'bg-white text-blue-600 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[11px] leading-none">Pengaturan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
