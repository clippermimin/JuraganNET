'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, Plus, Pencil, Trash2, Check, Calendar, Building2, User, ChevronUp, ChevronDown } from 'lucide-react';
import { RecurringBill } from '@/lib/types';
import { formatIDR } from '@/lib/utils';
import { ConfirmModal } from './ConfirmModal';

interface RecurringBillsModalProps {
  isOpen: boolean;
  bills: RecurringBill[];
  onClose: () => void;
  onAddBill: (bill: Omit<RecurringBill, 'id' | 'tenant_id' | 'is_paid'>) => void;
  onUpdateBill: (bill: RecurringBill) => void;
  onDeleteBill: (id: string) => void;
  onReorderBills?: (bills: RecurringBill[]) => void;
}

export const RecurringBillsModal: React.FC<RecurringBillsModalProps> = ({
  bills,
  isOpen,
  onClose,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onReorderBills,
}) => {
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<{id: string, title: string} | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState<string>('500000');
  const [dueDay, setDueDay] = useState<number | string>(5);
  const [account, setAccount] = useState<'BUSINESS' | 'PERSONAL'>('BUSINESS');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingBill(null);
    setTitle('');
    setAmountStr('');
    setDueDay(5);
    setAccount('BUSINESS');
    setIsPaid(false);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (bill: RecurringBill) => {
    setEditingBill(bill);
    setTitle(bill.title);
    setAmountStr(String(bill.amount));
    setDueDay(bill.due_day);
    setAccount(bill.account);
    setIsPaid(bill.is_paid);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const amtNum = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;
    const dayNum = Math.min(31, Math.max(1, Number(dueDay) || 1));

    if (editingBill) {
      onUpdateBill({
        ...editingBill,
        title: title.trim(),
        amount: amtNum,
        due_day: dayNum,
        account,
        is_paid: isPaid,
      });
    } else {
      onAddBill({
        title: title.trim(),
        amount: amtNum,
        due_day: dayNum,
        account,
      });
    }

    setIsFormOpen(false);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setBillToDelete({ id, title: name });
  };

  const handleConfirmDelete = () => {
    if (billToDelete) {
      onDeleteBill(billToDelete.id);
    }
    setBillToDelete(null);
  };

  const handleMove = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= bills.length) return;
    const newBills = [...bills];
    const temp = newBills[index];
    newBills[index] = newBills[targetIndex];
    newBills[targetIndex] = temp;
    if (onReorderBills) {
      onReorderBills(newBills);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-lg rounded-t-[32px] sm:rounded-3xl max-h-[90vh] overflow-y-auto overscroll-contain p-5 text-gray-900 shadow-xl animate-slideUp space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 leading-tight">
                Kelola Kewajiban Rutin
              </h3>
              <p className="text-[11px] text-gray-500">
                Atur checklist tagihan tetap bulanan RT/RW Net
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

        {/* Action / Add Form Toggle */}
        {!isFormOpen ? (
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600">
              Total ({bills.length} Tagihan Rutin)
            </span>
            <button
              onClick={handleOpenAddForm}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tagihan Baru</span>
            </button>
          </div>
        ) : (
          /* Form Section */
          <form onSubmit={handleSubmitForm} className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-orange-200/50">
              <h4 className="text-xs font-extrabold text-orange-950">
                {editingBill ? 'Edit Tagihan Rutin' : 'Tambah Tagihan Rutin Baru'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700 font-bold"
              >
                Batal
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Judul Tagihan / Pengeluaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: ISP Utama (500Mbps) / Listrik Server"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Amount & Due Day */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nominal (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Contoh: 1.235.000"
                    value={amountStr ? Number(amountStr.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                    onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-sm pointer-events-none">Rp</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tgl Jatuh Tempo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    placeholder="Tgl 5"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Account Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Kategori Akun Pengeluaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccount('BUSINESS')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    account === 'BUSINESS'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Kas Bisnis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccount('PERSONAL')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    account === 'PERSONAL'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Kas Pribadi</span>
                </button>
              </div>
            </div>

            {/* Status Pembayaran (Khusus Saat Edit) */}
            {editingBill && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Status Pembayaran Bulan Ini
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaid(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      isPaid
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lunas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      !isPaid
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Belum Lunas</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer mt-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Simpan Tagihan</span>
            </button>
          </form>
        )}

        {/* List of Recurring Bills */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {bills.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl">
              <p className="text-xs text-gray-400 font-medium">Belum ada tagihan rutin yang didaftarkan.</p>
            </div>
          ) : (
            bills.map((bill, index) => (
              <div
                key={bill.id}
                className="p-3 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition flex items-center justify-between gap-2 shadow-sm"
              >
                {/* Index Number */}
                <div className="flex-shrink-0 w-6 text-center">
                  <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                    #{index + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {bill.title}
                    </h4>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      bill.account === 'BUSINESS' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {bill.account === 'BUSINESS' ? 'Bisnis' : 'Pribadi'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      bill.is_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {bill.is_paid ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="font-extrabold text-blue-600">
                      {formatIDR(bill.amount)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Jatuh tempo tiap tgl {bill.due_day}
                    </span>
                  </div>
                </div>

                {/* Reorder Up/Down, Edit & Delete Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onReorderBills && (
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5 mr-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, -1)}
                        className="p-1 rounded-lg text-gray-500 hover:text-blue-600 disabled:opacity-20 hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
                        title="Geser Naik (Posisi Lebih Awal)"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === bills.length - 1}
                        onClick={() => handleMove(index, 1)}
                        className="p-1 rounded-lg text-gray-500 hover:text-blue-600 disabled:opacity-20 hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
                        title="Geser Turun"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleOpenEditForm(bill)}
                    className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Edit Tagihan"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(bill.id, bill.title)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Tagihan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      <ConfirmModal
        isOpen={!!billToDelete}
        title="Hapus Tagihan Rutin?"
        message={`Apakah Anda yakin ingin menghapus tagihan rutin "${billToDelete?.title}"?`}
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setBillToDelete(null)}
      />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
