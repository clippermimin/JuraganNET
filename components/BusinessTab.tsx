'use client';

import React, { useState } from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { BusinessSummary, RecurringBill, Transaction } from '@/lib/types';
import { formatIDR, formatDateIndo } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { CashflowChart } from './CashflowChart';
import { RecurringBillsModal } from './RecurringBillsModal';
import { ConfirmModal } from './ConfirmModal';
import { Settings, MoreVertical } from 'lucide-react';

interface BusinessTabProps {
  summary: BusinessSummary;
  bills: RecurringBill[];
  recentTransactions: Transaction[];
  onPayBill: (bill: RecurringBill) => void;
  onOpenCustomerList: () => void;
  onQuickRecord: (type: 'IN' | 'OUT', account: 'BUSINESS') => void;
  onAddBill?: (bill: Omit<RecurringBill, 'id' | 'tenant_id' | 'is_paid'>) => void;
  onUpdateBill?: (bill: RecurringBill) => void;
  onDeleteBill?: (id: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({
  summary,
  bills,
  recentTransactions,
  onPayBill,
  onOpenCustomerList,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<{id: string, name: string} | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const unpaidBills = bills.filter(b => !b.is_paid);
  const paidBills = bills.filter(b => b.is_paid);
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
              Net Profit (Laba Bersih)
            </span>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
            Realistis Kas
          </span>
        </div>

        {/* Big Net Profit Number */}
        <div className="my-1 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {formatIDR(summary.netProfit)}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Total Revenue dikurangi semua pengeluaran (OPEX)
          </p>
        </div>

        {/* Sub Cards: Total In vs Total Out */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-gray-100 relative z-10">
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-green-600 text-[11px] font-black uppercase tracking-wider mb-1">
                <ArrowDownLeft className="w-4 h-4 text-green-600" />
                <span>Revenue</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 leading-none mt-2">
                {formatIDR(summary.totalIn)}
              </p>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Total pemasukan</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-black uppercase tracking-wider mb-1">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                <span>Expenses</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 leading-none mt-2">
                {formatIDR(summary.totalOut)}
              </p>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">Total pengeluaran</p>
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
                Operational Expenses (OPEX)
              </h3>
              <p className="text-[11px] text-gray-500">
                Tagihan operasional tetap yang harus dibayar
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

        {/* List of Bills */}
        <div className="space-y-2.5">
          {bills.map((bill) => (
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

              {/* Action Button: One Click LUNAS */}
              <div>
                {bill.is_paid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> LUNAS
                  </span>
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

        {unpaidBills.length === 0 && (
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
          <span className="text-xs text-gray-500">Terbaru</span>
        </div>

        {recentTransactions.filter(t => t.account === 'BUSINESS').length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            Belum ada transaksi kas bisnis tercatat bulan ini.
          </p>
        ) : (
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
        )}
      </div>

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
      />
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
