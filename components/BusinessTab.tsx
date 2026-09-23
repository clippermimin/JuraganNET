'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Users,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ArrowUpDown,
  ArrowRight,
  Filter,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { BusinessSummary, RecurringBill, Transaction } from '@/lib/types';
import { formatIDR, formatDateIndo } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { CashflowChart } from './CashflowChart';
import { RecurringBillsModal } from './RecurringBillsModal';
import { ConfirmModal } from './ConfirmModal';
import { TransactionHistoryModal } from './TransactionHistoryModal';

export type BillFilterMode = 'UNPAID' | 'PAID' | 'ALL';

interface BusinessTabProps {
  summary: BusinessSummary;
  bills: RecurringBill[];
  recentTransactions: Transaction[];
  onPayBill: (bill: RecurringBill) => void;
  onUnpayBill?: (bill: RecurringBill) => void;
  onOpenCustomerList: () => void;
  onQuickRecord: (type: 'IN' | 'OUT', account: 'BUSINESS') => void;
  onAddBill?: (bill: Omit<RecurringBill, 'id' | 'tenant_id' | 'is_paid'>) => void;
  onUpdateBill?: (bill: RecurringBill) => void;
  onDeleteBill?: (id: string) => void;
  onReorderBills?: (bills: RecurringBill[]) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({
  summary,
  bills,
  recentTransactions,
  onPayBill,
  onUnpayBill,
  onOpenCustomerList,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onReorderBills,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<{id: string, name: string} | null>(null);
  const [billToUnpay, setBillToUnpay] = useState<RecurringBill | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [billFilterMode, setBillFilterMode] = useState<BillFilterMode>('UNPAID');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('juragannet_bills_filter') as BillFilterMode;
      if (saved && ['UNPAID', 'PAID', 'ALL'].includes(saved)) {
        setBillFilterMode(saved);
      }
    }
  }, []);

  const handleFilterChange = (mode: BillFilterMode) => {
    setBillFilterMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('juragannet_bills_filter', mode);
    }
  };

  const unpaidBills = useMemo(() => bills.filter(b => !b.is_paid), [bills]);
  const paidBills = useMemo(() => bills.filter(b => b.is_paid), [bills]);

  const displayedBills: RecurringBill[] = useMemo(() => {
    let list: RecurringBill[] = [];
    if (billFilterMode === 'UNPAID') {
      list = [...unpaidBills].sort((a, b) => a.due_day - b.due_day);
    } else if (billFilterMode === 'PAID') {
      list = [...paidBills].sort((a, b) => a.due_day - b.due_day);
    } else {
      // ALL: unpaid first (sorted by due_day), then paid (sorted by due_day)
      const u = [...unpaidBills].sort((a, b) => a.due_day - b.due_day);
      const p = [...paidBills].sort((a, b) => a.due_day - b.due_day);
      list = [...u, ...p];
    }
    return list;
  }, [billFilterMode, unpaidBills, paidBills]);
  const paidPercentage = summary.totalCustomers > 0 
    ? Math.round((summary.paidCustomers / summary.totalCustomers) * 100) 
    : 0;

  const handlePayClick = (bill: RecurringBill) => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#059669'],
      });
    } catch {
      // ignore
    }
    onPayBill(bill);
  };

  const handleConfirmDeleteTx = () => {
    if (txToDelete && onDeleteTransaction) {
      onDeleteTransaction(txToDelete.id);
    }
    setTxToDelete(null);
  };

  return (
    <div className="space-y-4 pb-28" onClick={() => setOpenDropdownId(null)}>
      {/* 1. Main Profit Highlight Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm text-gray-900 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Keuntungan Bersih (Cuan Bersih)
            </span>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
            Uang Kas Riil
          </span>
        </div>

        {/* Big Net Profit Number */}
        <div className="my-1 relative z-10">
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
            summary.netProfit >= 0 ? 'text-gray-900' : 'text-red-600'
          }`}>
            {formatIDR(summary.netProfit)}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Total Uang Masuk dikurangi semua Pengeluaran Operasional
          </p>
        </div>

        {/* Profit / Loss Visual Status Banner */}
        {summary.netProfit > 0 ? (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 relative z-10">
            <span className="text-xl flex-shrink-0">🎉</span>
            <div>
              <p className="text-xs font-black text-emerald-800">
                BULAN INI UNTUNG: {formatIDR(summary.netProfit)}
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Pemasukan lebih besar dari operasional. Bisnis RT/RW Net Anda sehat!
              </p>
            </div>
          </div>
        ) : summary.netProfit < 0 ? (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 relative z-10">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-xs font-black text-red-800">
                AWAS RUGI: -{formatIDR(Math.abs(summary.netProfit))}
              </p>
              <p className="text-[11px] text-red-600 mt-0.5">
                Pengeluaran melampaui pemasukan. Segera tagih pelanggan yang belum bayar!
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-2 relative z-10">
            <span className="text-base flex-shrink-0">⚖️</span>
            <p className="text-xs font-bold text-gray-700">
              Kas Seimbang: Belum ada selisih untung / rugi tercatat.
            </p>
          </div>
        )}

        {/* Sub Cards: Total In vs Total Out */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-gray-100 relative z-10">
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-green-600 text-[11px] font-black uppercase tracking-wider mb-1">
                <ArrowDownLeft className="w-4 h-4 text-green-600" />
                <span>Pemasukan (Masuk)</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 leading-none mt-2">
                {formatIDR(summary.totalIn)}
              </p>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Total uang masuk bisnis</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-black uppercase tracking-wider mb-1">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                <span>Pengeluaran (Keluar)</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 leading-none mt-2">
                {formatIDR(summary.totalOut)}
              </p>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Total uang keluar bisnis</p>
          </div>
        </div>

        {/* Pelanggan Collection Progress Quick Bar */}
        <div 
          onClick={onOpenCustomerList}
          className="mt-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl p-3 border border-gray-200 cursor-pointer transition active:scale-[0.99] group relative z-10"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-gray-900 font-semibold">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Progres Iuran Pelanggan</span>
            </div>
            <span className="font-bold text-blue-600">
              {summary.paidCustomers} Lunas ({paidPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-gray-500">
            <span>Sisa Belum Bayar: <b className="text-red-500">{summary.unpaidCustomers} pelanggan</b></span>
            <span className="text-blue-600 font-semibold group-hover:underline">Buka Daftar Pelanggan &rarr;</span>
          </div>
        </div>
      </div>

      {/* 1.5 Cashflow Chart */}
      <CashflowChart transactions={recentTransactions} />

      {/* 2. Widget Kewajiban Rutin Bulan Ini (Checklist Tagihan Tetap) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">
                Kewajiban Rutin Operasional (OPEX)
              </h3>
              <p className="text-[11px] text-gray-500">
                Tagihan operasional tetap (ISP, Listrik Server, Sewa Tiang, dll)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
              {paidBills.length}/{bills.length} Lunas
            </span>
            <button
              onClick={() => setIsBillsModalOpen(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition active:scale-95 cursor-pointer"
              title="Kelola Tagihan Rutin"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 no-scrollbar text-[11px]">
          <span className="text-gray-400 font-bold flex-shrink-0 flex items-center gap-1 pl-0.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => handleFilterChange('UNPAID')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
              billFilterMode === 'UNPAID'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>⚡ Belum Lunas</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              billFilterMode === 'UNPAID' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {unpaidBills.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('PAID')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
              billFilterMode === 'PAID'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>✅ Sudah Lunas</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              billFilterMode === 'PAID' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {paidBills.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
              billFilterMode === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>📋 Semua</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              billFilterMode === 'ALL' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {bills.length}
            </span>
          </button>
        </div>

        {/* List of Bills or Filter Empty State */}
        {displayedBills.length === 0 ? (
          <div>
            {billFilterMode === 'UNPAID' && (
              <div className="py-8 px-4 rounded-2xl bg-green-50/70 border border-green-200/60 text-center space-y-1.5 animate-fadeIn">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-green-800">
                  🎉 Luar Biasa! Semua Tagihan Bulan Ini Lunas!
                </p>
                <p className="text-[11px] text-green-600 max-w-xs mx-auto">
                  Tidak ada kewajiban operasional tertunda. Pilih tab "Sudah Lunas" jika ingin melihat riwayat tagihan.
                </p>
              </div>
            )}
            {billFilterMode === 'PAID' && (
              <div className="py-8 px-4 rounded-2xl bg-gray-50 border border-gray-200/60 text-center space-y-1.5 animate-fadeIn">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-700">
                  Belum Ada Tagihan yang Lunas
                </p>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Pilih filter "Belum Lunas" untuk mencatat pembayaran kewajiban rutin operasional.
                </p>
              </div>
            )}
            {billFilterMode === 'ALL' && (
              <div className="py-8 px-4 rounded-2xl bg-gray-50 border border-gray-200/60 text-center animate-fadeIn">
                <p className="text-xs text-gray-500">
                  Belum ada daftar kewajiban rutin operasional tercatat.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedBills.map((bill) => (
              <div 
                key={bill.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  bill.is_paid 
                    ? 'bg-gray-50 border-gray-100 text-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    bill.is_paid ? 'bg-green-50 text-green-500 border border-green-100' : 'bg-orange-50 text-orange-500 border border-orange-100'
                  }`}>
                    {bill.is_paid ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold truncate ${bill.is_paid ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {bill.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-extrabold ${bill.is_paid ? 'text-gray-400' : 'text-blue-600'}`}>
                        {formatIDR(bill.amount)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Jatuh tempo tgl {bill.due_day}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button: One Click LUNAS or Batalkan Lunas */}
                <div>
                  {bill.is_paid ? (
                    <button
                      onClick={() => setBillToUnpay(bill)}
                      type="button"
                      title="Klik untuk mengubah kembali status menjadi Belum Lunas"
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-green-700 hover:text-orange-700 px-3 py-2 rounded-xl bg-green-50 hover:bg-orange-50 border border-green-200 hover:border-orange-300 transition-all active:scale-95 cursor-pointer shadow-xs group"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 group-hover:hidden" />
                      <RotateCcw className="w-3.5 h-3.5 text-orange-600 hidden group-hover:inline transition-transform group-hover:-rotate-45" />
                      <span className="group-hover:hidden">LUNAS</span>
                      <span className="hidden group-hover:inline">Ubah Status</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayClick(bill)}
                      type="button"
                      className="min-h-[48px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <span>LUNAS</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {unpaidBills.length === 0 && billFilterMode === 'ALL' && bills.length > 0 && (
          <div className="mt-3 p-3 rounded-2xl bg-green-50 border border-green-100 text-center">
            <p className="text-xs font-bold text-green-700">
              🎉 Hebat! Semua kewajiban rutin bulan ini sudah lunas terbayar!
            </p>
          </div>
        )}
      </div>

      {/* 3. Ringkasan Arus Kas Bisnis Terbaru */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">
              Arus Kas Bisnis Terkini
            </h3>
          </div>
          {recentTransactions.filter(t => t.account === 'BUSINESS').length > 0 && (
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <span className="text-[10px] opacity-75">
                ({recentTransactions.filter(t => t.account === 'BUSINESS').length})
              </span>
            </button>
          )}
        </div>

        {recentTransactions.filter(t => t.account === 'BUSINESS').length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Belum ada transaksi kas bisnis tercatat bulan ini.
          </p>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {recentTransactions
                .filter(t => t.account === 'BUSINESS')
                .slice(0, 5)
                .map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        tx.type === 'IN' 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-red-50 text-red-500 border border-red-100'
                      }`}>
                        {tx.type === 'IN' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {tx.category}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {tx.notes || (tx.type === 'IN' ? 'Pemasukan bisnis' : 'Pengeluaran')}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          {formatDateIndo(tx.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 relative">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-black ${
                          tx.type === 'IN' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {tx.type === 'IN' ? '+' : '-'}{formatIDR(tx.amount)}
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

            {recentTransactions.filter(t => t.account === 'BUSINESS').length > 5 && (
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="w-full mt-3 py-2 px-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-gray-700 hover:text-indigo-600 flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Lihat Seluruh Mutasi ({recentTransactions.filter(t => t.account === 'BUSINESS').length} Transaksi)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Arus Kas Bisnis"
        account="BUSINESS"
        transactions={recentTransactions}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
      />

      {/* Recurring Bills Modal */}
      <RecurringBillsModal
        isOpen={isBillsModalOpen}
        bills={bills}
        onClose={() => setIsBillsModalOpen(false)}
        onAddBill={(data) => {
          if (onAddBill) onAddBill(data);
        }}
        onUpdateBill={(data) => {
          if (onUpdateBill) onUpdateBill(data);
        }}
        onDeleteBill={(id) => {
          if (onDeleteBill) onDeleteBill(id);
        }}
        onReorderBills={(newBills) => {
          if (onReorderBills) onReorderBills(newBills);
        }}
      />
      <ConfirmModal
        isOpen={!!txToDelete}
        title="Hapus Transaksi?"
        message={`Apakah Anda yakin ingin menghapus data transaksi "${txToDelete?.name}"?`}
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDeleteTx}
        onCancel={() => setTxToDelete(null)}
      />
      <ConfirmModal
        isOpen={!!billToUnpay}
        title="Ubah Status Jadi Belum Lunas?"
        message={`Apakah Anda ingin membatalkan status lunas tagihan "${billToUnpay?.title}"? Transaksi pengeluaran kas senilai ${billToUnpay ? formatIDR(billToUnpay.amount) : ''} akan dibatalkan/dihapus secara otomatis.`}
        confirmText="Ya, Batalkan Lunas"
        cancelText="Batal"
        onConfirm={() => {
          if (billToUnpay && onUnpayBill) {
            onUnpayBill(billToUnpay);
          }
          setBillToUnpay(null);
        }}
        onCancel={() => setBillToUnpay(null)}
      />
    </div>
  );
};
