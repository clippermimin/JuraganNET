'use client';

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Check, 
  Database, 
  Share2, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  Phone,
  Sparkles,
  Copy,
  Crown,
  LogOut
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatIDR } from '@/lib/utils';
import { ConfirmModal } from './ConfirmModal';
import { Tenant, BusinessSummary, PersonalSummary } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  tenant: Tenant;
  businessSummary: BusinessSummary;
  personalSummary: PersonalSummary;
  onClose: () => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onResetFactory: () => void;
  onOpenExport: () => void;
  onOpenSuperAdmin?: () => void;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  tenant,
  businessSummary,
  personalSummary,
  onClose,
  onUpdateTenant,
  onResetFactory,
  onOpenExport,
  onOpenSuperAdmin,
  onLogout,
}) => {
  const [bizName, setBizName] = useState(tenant.business_name);
  const [ownerName, setOwnerName] = useState(tenant.owner_name);
  const [phone, setPhone] = useState(tenant.phone || '');
  const [copiedText, setCopiedText] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTenant({
      ...tenant,
      business_name: bizName,
      owner_name: ownerName,
      phone,
    });
    onClose();
  };

  // Generate Rekap Keuangan Text for WhatsApp
  const handleCopyRekapWA = () => {
    const text = `📊 *REKAP KAS JURAGAN NET*\n*${tenant.business_name.toUpperCase()}*\n━━━━━━━━━━━━━━━━━\n\n` +
      `🏢 *KAS BISNIS RT/RW:*\n` +
      `• Total Iuran Masuk: ${formatIDR(businessSummary.totalIn)}\n` +
      `• Total Operasional: ${formatIDR(businessSummary.totalOut)}\n` +
      `• *UNTUNG BERSIH:* ${formatIDR(businessSummary.netProfit)}\n` +
      `• Pelanggan Lunas: ${businessSummary.paidCustomers} Orang\n\n` +
      `🏠 *DOMPET PRIBADI:*\n` +
      `• Jatah Gaji: ${formatIDR(personalSummary.salaryBudget)}\n` +
      `• Terpakai: ${formatIDR(personalSummary.totalOut)}\n` +
      `• Sisa Uang Aman: ${formatIDR(personalSummary.safeBalance)}\n\n` +
      `Dicatat via JuraganNet PWA 🚀`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-md rounded-t-[32px] sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 text-gray-900 shadow-xl animate-slideUp space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 leading-tight">
                Kelola Tenant & Pengaturan
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                SaaS Multi-Tenant & Database Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Usaha Form */}

        {/* 2. Custom Tenant Form */}
        <form onSubmit={handleSave} className="space-y-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nama Usaha RT/RW Net:
            </label>
            <input
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nama Pemilik:
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                No WhatsApp Usaha:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="0812..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Check className="w-5 h-5" /> Simpan Perubahan
          </button>
        </form>

        {/* 3. Export Data Bulanan (Excel & PDF) */}
        <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h4 className="font-extrabold text-xs text-blue-900">Ekspor Laporan Bulanan</h4>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Excel & PDF
            </span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Unduh rekap mutasi kas, daftar status iuran pelanggan, dan tagihan rutin dalam format spreadsheet Excel (.xlsx) atau dokumen PDF resmi A4 siap cetak.
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenExport();
            }}
            type="button"
            className="w-full py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <span>Buka Menu Unduh Excel & PDF &rarr;</span>
          </button>
        </div>

        {/* 4. Share Rekap Kas WhatsApp */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-green-500" />
            <h4 className="font-bold text-xs text-gray-900">Bagikan Rekap Kas ke WhatsApp</h4>
          </div>
          <p className="text-[11px] text-gray-500">
            Salin teks ringkasan rapi untuk dikirimkan ke grup rekan bisnis atau keluarga.
          </p>
          <button
            onClick={handleCopyRekapWA}
            type="button"
            className="min-h-[44px] w-full py-2 px-3 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 active:bg-green-200 text-green-700 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Teks Rekap Tersalin! Siap Tempel di WA</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Teks Rekap Kas untuk WA</span>
              </>
            )}
          </button>
        </div>

        {/* 5. Supabase Status Card */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <h4 className="font-bold text-gray-900">Koneksi Database Supabase</h4>
          </div>
          {isSupabaseConfigured ? (
            <p className="text-blue-600 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Terhubung ke Supabase Cloud (Data Tersinkron)
            </p>
          ) : (
            <div className="space-y-1 text-gray-700">
              <p className="text-[11px] text-orange-600">
                ⚡ Mode Cepat (Local Storage Active). Aplikasi berjalan 100% instan tanpa koneksi database eksternal.
              </p>
              <p className="text-[10px] text-gray-500">
                Untuk menghubungkan ke Supabase, isi file <code>.env.local</code> dengan:
                <br /><code>NEXT_PUBLIC_SUPABASE_URL=https://...</code>
                <br /><code>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</code>
              </p>
            </div>
          )}
        </div>



        {/* 7. Logout Button */}
        {onLogout && (
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              type="button"
              className="w-full py-4 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              <span>Keluar / Logout Akun</span>
            </button>
          </div>
        )}

        {/* 8. Reset Data Factory */}
        <div className="pt-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            type="button"
            className="w-full py-4 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset ke Data Awal Demo (Arjuna Net)</span>
          </button>
        </div>

      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Semua Data?"
        message="Apakah Anda yakin ingin mereset semua data transaksi dan pelanggan kembali ke data awal demo Arjuna Net? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Reset Data"
        onConfirm={() => {
          onResetFactory();
          setShowResetConfirm(false);
          onClose();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
