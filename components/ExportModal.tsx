'use client';

import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Check, 
  Sparkles,
  Calendar,
  Building2,
  Users
} from 'lucide-react';
import { BusinessSummary, Customer, PersonalSummary, RecurringBill, Tenant, Transaction } from '@/lib/types';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  businessSummary: BusinessSummary;
  personalSummary: PersonalSummary;
  transactions: Transaction[];
  customers: Customer[];
  bills: RecurringBill[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  tenant,
  selectedMonth,
  onMonthChange,
  businessSummary,
  personalSummary,
  transactions,
  customers,
  bills,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'EXCEL' | 'PDF' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const exportData = {
    tenant,
    month: selectedMonth,
    businessSummary,
    personalSummary,
    transactions,
    customers,
    bills,
  };

  const handleExportExcel = () => {
    setDownloadingFormat('EXCEL');
    try {
      exportToExcel(exportData);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#059669'],
        });
      } catch {}
      setSuccessMessage('File Excel (.xlsx) berhasil diunduh ke perangkat Anda!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Gagal mengekspor Excel: ' + (err as Error).message);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleExportPDF = () => {
    setDownloadingFormat('PDF');
    try {
      exportToPDF(exportData);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#10b981'],
        });
      } catch {}
      setSuccessMessage('File Dokumen PDF (.pdf) resmi berhasil diunduh!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Gagal mengekspor PDF: ' + (err as Error).message);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-md rounded-t-[32px] sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 text-gray-900 shadow-xl animate-slideUp space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 leading-tight">
                Unduh Laporan Bulanan
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Pilih format Excel atau PDF siap cetak
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

        {/* Info Box */}
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-gray-400" /> Usaha:
            </span>
            <span className="font-bold text-gray-900">{tenant.business_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> Periode:
            </span>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="appearance-none bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs py-1 pl-3 pr-7 rounded-lg border border-blue-200 outline-none cursor-pointer transition-colors"
              >
                {[
                  'September 2026',
                  'Agustus 2026',
                  'Juli 2026',
                  'Juni 2026',
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" /> Total Data Pelanggan:
            </span>
            <span className="font-bold text-gray-900">{customers.length} Orang</span>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-green-700 text-xs font-bold animate-fadeIn">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Format Options */}
        <div className="space-y-3 pt-1">
          {/* 1. EXCEL (.xlsx) CARD */}
          <div className="bg-white hover:bg-green-50 p-4 rounded-2xl border border-green-200 transition space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-green-900">
                    Format Excel (.xlsx)
                  </h4>
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold border border-green-200">
                    4 Lembar Kerja
                  </span>
                </div>
                <p className="text-[11px] text-green-800 mt-1 leading-relaxed">
                  Lengkap dengan Sheet <b>Ringkasan Keuangan</b>, <b>Mutasi Transaksi</b>, <b>Data Pelanggan (Lunas & Belum)</b>, serta <b>Tagihan Rutin</b>. Siap diedit di Microsoft Excel atau Google Sheets.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              disabled={downloadingFormat !== null}
              type="button"
              className="w-full py-4 px-4 rounded-2xl bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>{downloadingFormat === 'EXCEL' ? 'Menyiapkan Excel...' : 'Unduh Laporan Excel (.xlsx)'}</span>
            </button>
          </div>

          {/* 2. PDF (.pdf) CARD */}
          <div className="bg-white hover:bg-red-50 p-4 rounded-2xl border border-red-200 transition space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-red-900">
                    Format Dokumen PDF (.pdf)
                  </h4>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-200">
                    Siap Cetak A4
                  </span>
                </div>
                <p className="text-[11px] text-red-800 mt-1 leading-relaxed">
                  Laporan resmi rapi dengan kop dokumen <b>{tenant.business_name}</b>, tabel ringkasan laba bersih, checklist tagihan rutin, rekapitulasi iuran per Area RW, dan mutasi kas terkini.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={downloadingFormat !== null}
              type="button"
              className="w-full py-4 px-4 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>{downloadingFormat === 'PDF' ? 'Menyiapkan PDF...' : 'Unduh Laporan PDF Resmi (.pdf)'}</span>
            </button>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-2 text-[11px] text-orange-800">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
          <p>
            Hasil unduhan akan langsung tersimpan di folder Download HP atau Laptop Anda. Dokumen PDF siap langsung dibagikan atau dicetak untuk laporan pelanggan/keluarga.
          </p>
        </div>

      </div>
    </div>
  );
};
