'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  AlertTriangle, 
  TrendingDown, 
  ShieldCheck, 
  HeartHandshake, 
  Edit3, 
  Check,
  Flame,
  ShoppingBag,
  Sparkles,
  MoreVertical
} from 'lucide-react';
import { PersonalSummary, Transaction } from '@/lib/types';
import { formatIDR, formatDateIndo } from '@/lib/utils';
import { ConfirmModal } from './ConfirmModal';

interface PersonalTabProps {
  summary: PersonalSummary;
  recentTransactions: Transaction[];
  onUpdateSalary: (budget: number) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const PersonalTab: React.FC<PersonalTabProps> = ({
  summary,
  recentTransactions,
  onUpdateSalary,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [tempSalary, setTempSalary] = useState(String(summary.salaryBudget));
  const [txToDelete, setTxToDelete] = useState<{id: string, name: string} | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleSaveSalary = () => {
    const val = parseInt(tempSalary.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      onUpdateSalary(val);
    }
    setIsEditingSalary(false);
  };

  const isSafe = summary.safeBalance > 1000000;
  const isWarning = summary.safeBalance <= 1000000 && summary.safeBalance >= 0;
  const isDanger = summary.safeBalance < 0;

  const getDynamicTip = () => {
    if (summary.topLeaks.length === 0) {
      return (
        <p className="text-[11px] text-orange-800 leading-relaxed">
          <b>Tips Juragan:</b> Belum ada pengeluaran pribadi bulan ini. Terus pantau dan catat setiap transaksi agar keuanganmu tetap sehat!
        </p>
      );
    }

    const topCategory = summary.topLeaks[0].category;

    switch (topCategory) {
      case 'Jajan / Nongkrong / Kopi':
        return (
          <p className="text-[11px] text-orange-800 leading-relaxed">
            <b>Tips Juragan:</b> Wah, pengeluaran terbesarmu ada di <i>{topCategory}</i>! Hati-hati bocor alus, coba rem sedikit agar jatah aman sampai akhir bulan.
          </p>
        );
      case 'Keluarga / Orang Tua':
      case 'Zakat / Sedekah':
      case 'Investasi Domba / Ternak':
        return (
          <p className="text-[11px] text-orange-800 leading-relaxed">
            <b>Tips Juragan:</b> Pengeluaran di <i>{topCategory}</i> itu ibadah dan investasi sosial yang bagus. Tapi pastikan jatah makan dapur harianmu tetap aman, ya!
          </p>
        );
      case 'Belanja Dapur / Istri':
      case 'Listrik & Kebutuhan Rumah':
        return (
          <p className="text-[11px] text-orange-800 leading-relaxed">
            <b>Tips Juragan:</b> <i>{topCategory}</i> emang kebutuhan pokok yang gak bisa di-skip. Pastikan belanja sesuai daftar biar gak over-budget.
          </p>
        );
      case 'Bensin & Servis Motor':
        return (
          <p className="text-[11px] text-orange-800 leading-relaxed">
            <b>Tips Juragan:</b> Biaya operasional <i>{topCategory}</i> lumayan besar nih. Coba atur rute harian lebih efisien buat berhemat!
          </p>
        );
      case 'Cicilan / Hutang':
        return (
          <p className="text-[11px] text-orange-800 leading-relaxed">
            <b>Tips Juragan:</b> Wah, porsi terbesar lari ke <i>{topCategory}</i>. Selalu utamakan bayar tepat waktu biar nama baik tetap terjaga, juragan!
          </p>
        );
      default:
        return (
          <p className="text-[11px] text-orange-800 leading-relaxed">
            <b>Tips Juragan:</b> Pengeluaran terbesarmu saat ini ada di <i>{topCategory}</i>. Selalu pantau dan catat biar keuangan keluarga tetap stabil, juragan!
          </p>
        );
    }
  };

  const handleConfirmDeleteTx = () => {
    if (txToDelete && onDeleteTransaction) {
      onDeleteTransaction(txToDelete.id);
    }
    setTxToDelete(null);
  };

  return (
    <div className="space-y-4 pb-28" onClick={() => setOpenDropdownId(null)}>
      {/* 1. Kartu Dompet Pribadi (Personal Wallet) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm text-gray-900 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Dompet Pribadi & Keluarga
            </span>
          </div>
          <button
            onClick={() => setIsEditingSalary(!isEditingSalary)}
            className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ubah Jatah Gaji</span>
          </button>
        </div>

        {/* Salary Edit Drawer if open */}
        {isEditingSalary && (
          <div className="my-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-2 animate-fadeIn">
            <span className="text-sm text-gray-500 font-black">Rp</span>
            <input
              type="text"
              value={tempSalary}
              onChange={(e) => setTempSalary(e.target.value)}
              className="flex-1 bg-white px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-900 border border-gray-200 outline-none focus:border-indigo-500 transition-colors"
              placeholder="5000000"
            />
            <button
              onClick={handleSaveSalary}
              className="px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 active:scale-95 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Simpan
            </button>
          </div>
        )}

        {/* Main Safe Money Highlight */}
        <div className="my-1">
          <span className="text-xs text-gray-500">Sisa Uang Jajan & Kebutuhan Aman:</span>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight mt-0.5 ${
            isSafe ? 'text-green-600' : isWarning ? 'text-orange-500' : 'text-red-600'
          }`}>
            {formatIDR(summary.safeBalance)}
          </h2>
          
          <div className="flex items-center gap-1.5 mt-1.5">
            {isSafe && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                <ShieldCheck className="w-3 h-3" /> Dompet aman terkendali!
              </span>
            )}
            {isWarning && (
              <span className="inline-flex items-center gap-1 text-[11px] text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                <AlertTriangle className="w-3 h-3" /> Awas! Uang jajan mulai menipis
              </span>
            )}
            {isDanger && (
              <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 font-bold">
                <AlertTriangle className="w-3 h-3" /> Bahaya! Pengeluaran melebihi jatah gaji
              </span>
            )}
          </div>
        </div>

        {/* Sub Cards: Jatah Gaji vs Total Terpakai */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
            <span className="text-[11px] text-indigo-600 font-semibold block mb-0.5">
              Jatah Gaji dari Bisnis
            </span>
            <p className="text-base font-extrabold text-gray-900">
              {formatIDR(summary.salaryBudget)}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Batas aman sebulan</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
            <span className="text-[11px] text-red-600 font-semibold block mb-0.5">
              Sudah Terpakai
            </span>
            <p className="text-base font-extrabold text-red-600">
              {formatIDR(summary.totalOut)}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Pengeluaran pribadi</p>
          </div>
        </div>
      </div>

      {/* 2. Kartu Deteksi Kebocoran ("Uang Keluar Paling Banyak") */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">
                Deteksi Kebocoran Uang
              </h3>
              <p className="text-[11px] text-gray-500">
                Pos pengeluaran terbesar yang paling banyak menguras kantong
              </p>
            </div>
          </div>
        </div>

        {summary.topLeaks.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Belum ada catatan pengeluaran pribadi bulan ini.
          </p>
        ) : (
          <div className="space-y-3 mt-3">
            {summary.topLeaks.map((leak, index) => (
              <div key={leak.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-black flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-gray-700">
                      {leak.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-red-500">
                      {formatIDR(leak.amount)}
                    </span>
                    <span className="text-[10px] text-gray-500 ml-1">
                      ({leak.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-red-500 to-orange-400' 
                        : 'bg-indigo-400'
                    }`}
                    style={{ width: `${Math.min(leak.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tip Anti-Bocor */}
        <div className="mt-4 p-3 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          {getDynamicTip()}
        </div>
      </div>

      {/* 3. Riwayat Pengeluaran Pribadi */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">
              Catatan Pengeluaran Pribadi
            </h3>
          </div>
          <span className="text-xs text-gray-500">Terbaru</span>
        </div>

        {recentTransactions.filter(t => t.account === 'PERSONAL').length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Belum ada catatan pengeluaran pribadi.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTransactions
              .filter(t => t.account === 'PERSONAL')
              .slice(0, 6)
              .map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-red-50 text-red-500 border border-red-100">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {tx.category}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {tx.notes || 'Pengeluaran pribadi'}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {formatDateIndo(tx.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 relative">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-red-500">
                        -{formatIDR(tx.amount)}
                      </p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === tx.id ? null : tx.id);
                        }}
                        className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === tx.id && (
                        <div 
                          className="absolute right-0 top-6 w-32 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-30 animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-1">
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                if (onEditTransaction) onEditTransaction(tx);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            >
                              Edit Data
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                setTxToDelete({ id: tx.id, name: tx.category });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition mt-0.5"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!txToDelete}
        title="Hapus Transaksi?"
        message={`Apakah Anda yakin ingin menghapus data transaksi "${txToDelete?.name}"?`}
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDeleteTx}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
