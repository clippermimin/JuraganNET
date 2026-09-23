'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Pencil, 
  Trash2, 
  ShoppingBag, 
  Building2,
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatIDR, formatDateIndo } from '@/lib/utils';
import { ConfirmModal } from './ConfirmModal';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  account: 'BUSINESS' | 'PERSONAL';
  transactions: Transaction[];
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  title,
  account,
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [txToDelete, setTxToDelete] = useState<{ id: string; name: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter transactions for this specific account
  const accountTransactions = useMemo(() => {
    return transactions.filter(t => t.account === account);
  }, [transactions, account]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    accountTransactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [accountTransactions]);

  // Filtered by search, category, and type
  const filteredTransactions = useMemo(() => {
    return accountTransactions.filter(t => {
      // Type filter
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catMatch = t.category.toLowerCase().includes(q);
        const notesMatch = t.notes?.toLowerCase().includes(q);
        const amountMatch = String(t.amount).includes(q);
        if (!catMatch && !notesMatch && !amountMatch) return false;
      }

      return true;
    });
  }, [accountTransactions, typeFilter, selectedCategory, searchQuery]);

  // Total summary of filtered
  const totalOut = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'OUT')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalIn = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-lg rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col text-gray-900 shadow-2xl animate-slideUp overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              account === 'PERSONAL' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {account === 'PERSONAL' ? <ShoppingBag className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Total {filteredTransactions.length} dari {accountTransactions.length} catatan mutasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-gray-50/70 border-b border-gray-100 space-y-2.5 flex-shrink-0">
          
          {/* Summary Banner */}
          <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {account === 'PERSONAL' ? 'Total Pengeluaran Terfilter' : 'Ringkasan Terfilter'}
              </span>
              <p className="text-base font-black text-red-500 mt-0.5">
                -{formatIDR(totalOut)}
              </p>
            </div>
            {totalIn > 0 && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Uang Masuk
                </span>
                <p className="text-base font-black text-green-600 mt-0.5">
                  +{formatIDR(totalIn)}
                </p>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari keterangan, nama, atau kategori..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips Scrollable */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition active:scale-95 cursor-pointer flex-shrink-0 ${
                  selectedCategory === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition active:scale-95 cursor-pointer flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Transaction List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Tidak ada mutasi yang cocok dengan pencarian.'
                  : 'Belum ada catatan mutasi.'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    tx.type === 'IN' 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : 'bg-red-50 text-red-500 border border-red-100'
                  }`}>
                    {tx.type === 'IN' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {tx.category}
                      </p>
                      {tx.type === 'IN' && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-green-100 text-green-700">
                          Masuk
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 truncate mt-0.5">
                      {tx.notes || (tx.type === 'IN' ? 'Pemasukan' : 'Pengeluaran')}
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {formatDateIndo(tx.created_at)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <p className={`text-xs font-black ${
                    tx.type === 'IN' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {tx.type === 'IN' ? '+' : '-'}{formatIDR(tx.amount)}
                  </p>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onEditTransaction) onEditTransaction(tx);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Edit Data"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxToDelete({ id: tx.id, name: `${tx.category} (${tx.notes || formatIDR(tx.amount)})` })}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-extrabold text-xs transition active:scale-95 cursor-pointer"
          >
            Tutup Mutasi
          </button>
        </div>

      </div>

      <ConfirmModal
        isOpen={!!txToDelete}
        title="Hapus Transaksi?"
        message={`Apakah Anda yakin ingin menghapus data transaksi "${txToDelete?.name}"?`}
        confirmText="Ya, Hapus"
        onConfirm={() => {
          if (txToDelete && onDeleteTransaction) {
            onDeleteTransaction(txToDelete.id);
          }
          setTxToDelete(null);
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};
