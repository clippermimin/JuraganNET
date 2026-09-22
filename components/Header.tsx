'use client';

import React from 'react';
import { Hexagon, Calendar, Settings, ShieldCheck, Database, Download } from 'lucide-react';
import { Tenant } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getRecentMonthOptions } from '@/lib/store';

interface HeaderProps {
  tenant: Tenant;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tenant,
  selectedMonth,
  onMonthChange,
  onOpenSettings,
  onOpenExport,
}) => {
  const monthOptions = React.useMemo(() => {
    const list = getRecentMonthOptions(6);
    if (selectedMonth && !list.includes(selectedMonth)) {
      return [selectedMonth, ...list];
    }
    return list;
  }, [selectedMonth]);

  return (
    <header className="sticky top-0 z-30 bg-blue-600 text-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Hexagon className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white leading-tight">
                {tenant.business_name}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-100 font-medium tracking-wide">
                  <Database className="w-3 h-3" /> Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-100 font-medium tracking-wide">
                  <ShieldCheck className="w-3 h-3" /> Offline Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Month Picker, Export & Settings */}
        <div className="flex items-center gap-1.5">
          {/* Month Selector */}
          <div className="relative">
            <label htmlFor="month-select" className="sr-only">Pilih Bulan</label>
            <div className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 border border-blue-500 text-white rounded-lg px-2 py-1.5 text-xs font-semibold shadow-inner transition cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-blue-200 pointer-events-none" />
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-1"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m} className="bg-white text-gray-900">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Button (Excel & PDF) */}
          <button
            onClick={onOpenExport}
            type="button"
            aria-label="Unduh Laporan Excel & PDF"
            title="Unduh Laporan Excel & PDF"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Settings / Tenant Button */}
          <button
            onClick={onOpenSettings}
            type="button"
            aria-label="Pengaturan & Tenant"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
