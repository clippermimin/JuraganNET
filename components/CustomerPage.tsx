'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Send, 
  Phone, 
  Users, 
  MapPin, 
  Check, 
  X,
  MessageSquare,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  History,
  RotateCcw,
} from 'lucide-react';
import { Customer, Tenant, Transaction } from '@/lib/types';
import { formatIDR, formatDateIndo, getWhatsAppReceiptUrl, getWhatsAppReminderUrl } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { CustomerModal } from './CustomerModal';
import { ConfirmModal } from './ConfirmModal';

interface CustomerPageProps {
  customers: Customer[];
  tenant: Tenant;
  transactions?: Transaction[];
  onReceivePayment: (customer: Customer) => void;
  onUnpayPayment?: (customer: Customer) => void;
  onBackToDashboard: () => void;
  onAddCustomer?: (customer: Omit<Customer, 'id' | 'tenant_id' | 'is_paid'>) => void;
  onUpdateCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
}

export const CustomerPage: React.FC<CustomerPageProps> = ({
  customers,
  tenant,
  transactions = [],
  onReceivePayment,
  onUnpayPayment,
  onBackToDashboard,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [displayLimit, setDisplayLimit] = useState<number>(30);
  
  // Modal & Menu states
  const [receiptTarget, setReceiptTarget] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeMenuCustId, setActiveMenuCustId] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [expandedHistoryCustId, setExpandedHistoryCustId] = useState<string | null>(null);
  const [isQuickBillingOpen, setIsQuickBillingOpen] = useState(false);
  const [remindedCustIds, setRemindedCustIds] = useState<Record<string, boolean>>({});

  const unpaidCustomers = useMemo(() => {
    return customers.filter(c => !c.is_paid);
  }, [customers]);

  const getCustomerPaymentHistory = (custId: string, custName: string) => {
    if (!transactions) return [];
    return transactions
      .filter(t => t.customer_id === custId || (t.notes && t.notes.toLowerCase().includes(custName.toLowerCase())))
      .slice(0, 5);
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteCust = (cust: Customer) => {
    setCustomerToDelete(cust);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete && onDeleteCustomer) {
      onDeleteCustomer(customerToDelete.id);
    }
    setCustomerToDelete(null);
  };

  const handleSaveCustomer = (data: Omit<Customer, 'id' | 'tenant_id' | 'is_paid'> | Customer) => {
    if ('id' in data) {
      if (onUpdateCustomer) onUpdateCustomer(data as Customer);
    } else {
      if (onAddCustomer) onAddCustomer(data);
    }
  };

  // Extract unique areas
  const areas = useMemo(() => {
    const set = new Set(customers.map(c => c.area));
    return Array.from(set).sort();
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return customers.filter(c => {
      // Area match
      if (selectedArea !== 'ALL' && c.area !== selectedArea) return false;
      
      // Status match
      if (statusFilter === 'UNPAID' && c.is_paid) return false;
      if (statusFilter === 'PAID' && !c.is_paid) return false;

      // Query match (Name, phone, notes)
      if (query) {
        return (
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.area.toLowerCase().includes(query) ||
          (c.notes && c.notes.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [customers, selectedArea, statusFilter, searchQuery]);

  // Overall counters
  const totalCount = customers.length;
  const paidCount = customers.filter(c => c.is_paid).length;
  const unpaidCount = totalCount - paidCount;

  const handleTerimaCash = (cust: Customer) => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    onReceivePayment(cust);
    // Show prompt to send WhatsApp receipt
    setReceiptTarget(cust);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header Info */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                Daftar Pelanggan RT/RW Net
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Pencatatan iuran & kirim kwitansi WhatsApp satu ketukan
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Counter Badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-2xl p-2.5 text-center border border-gray-200">
            <span className="text-[10px] text-gray-500 font-medium block">Total Pelanggan</span>
            <span className="text-base font-extrabold text-gray-900">{totalCount}</span>
          </div>
          <div className="bg-green-50 rounded-2xl p-2.5 text-center border border-green-200">
            <span className="text-[10px] text-green-700 font-medium block">Sudah Lunas</span>
            <span className="text-base font-extrabold text-green-600">{paidCount}</span>
          </div>
          <div className="bg-red-50 rounded-2xl p-2.5 text-center border border-red-200">
            <span className="text-[10px] text-red-700 font-medium block">Belum Bayar</span>
            <span className="text-base font-extrabold text-red-600">{unpaidCount}</span>
          </div>
        </div>

        {/* Quick Billing Action Button */}
        {unpaidCount > 0 && (
          <button
            onClick={() => setIsQuickBillingOpen(true)}
            type="button"
            className="w-full mt-3 min-h-[44px] py-2.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Mode Tagih Cepat via WA ({unpaidCount} Belum Bayar)</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <label htmlFor="customer-search" className="sr-only">Cari Nama Pelanggan / No HP</label>
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="customer-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pelanggan, no HP, atau wilayah/server..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Area Filter Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedArea('ALL')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 flex-shrink-0 ${
              selectedArea === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Semua Wilayah / Server
          </button>
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 flex-shrink-0 ${
                selectedArea === area
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`min-h-[44px] rounded-xl font-bold text-xs transition border border-transparent ${
              statusFilter === 'ALL'
                ? 'bg-white text-gray-900 shadow-sm border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Semua ({filteredCustomers.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`min-h-[44px] rounded-xl font-bold text-xs transition border border-transparent ${
              statusFilter === 'UNPAID'
                ? 'bg-red-100 text-red-700 border-red-200 shadow-sm'
                : 'text-gray-500 hover:text-red-600'
            }`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`min-h-[44px] rounded-xl font-bold text-xs transition border border-transparent ${
              statusFilter === 'PAID'
                ? 'bg-green-100 text-green-700 border-green-200 shadow-sm'
                : 'text-gray-500 hover:text-green-600'
            }`}
          >
            Lunas
          </button>
        </div>
      </div>

      {/* Customer List Cards */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-sm">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">Tidak ada pelanggan ditemukan</p>
            <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter wilayah/server Anda</p>
          </div>
        ) : (
          filteredCustomers.slice(0, displayLimit).map((customer) => (
            <div
              key={customer.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                customer.is_paid
                  ? 'bg-green-50 border-green-100 text-gray-700'
                  : 'bg-white border-gray-200 text-gray-900 shadow-sm'
              }`}
            >
              {/* Card Top: Name & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
                      {customer.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3 text-blue-500" /> {customer.area}
                    </span>
                    <span>•</span>
                    <span className={`font-bold ${customer.is_paid ? 'text-green-700' : 'text-blue-600'}`}>
                      {formatIDR(customer.monthly_fee)}
                    </span>
                  </div>
                </div>

                {/* Status Pill & Discrete Menu */}
                <div className="flex items-center gap-1.5 relative">
                  {customer.is_paid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> LUNAS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                      <Clock className="w-3.5 h-3.5" /> BELUM
                    </span>
                  )}
                  
                  {/* MoreVertical Button */}
                  <button
                    onClick={() => setActiveMenuCustId(activeMenuCustId === customer.id ? null : customer.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition active:scale-95 cursor-pointer"
                    title="Menu Opsi"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Floating Action Menu */}
                  {activeMenuCustId === customer.id && (
                    <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 rounded-2xl shadow-xl p-1 w-36 animate-fadeIn">
                      <button
                        onClick={() => {
                          setActiveMenuCustId(null);
                          handleOpenEditModal(customer);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-500" />
                        <span>Edit Data</span>
                      </button>
                      {customer.is_paid && onUnpayPayment && (
                        <button
                          onClick={() => {
                            setActiveMenuCustId(null);
                            onUnpayPayment(customer);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                          <span>Batalkan Lunas</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveMenuCustId(null);
                          handleDeleteCust(customer);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom: Big Action Buttons */}
              <div className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${
                customer.is_paid ? 'border-green-200/60' : 'border-gray-100'
              }`}>
                <span className="text-[11px] text-gray-500 truncate">
                  HP: {customer.phone}
                </span>

                <div className="flex items-center gap-1.5">
                  {customer.is_paid ? (
                    /* Kwitansi WhatsApp Button */
                    <a
                      href={getWhatsAppReceiptUrl(customer, tenant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white hover:bg-green-50 active:bg-green-100 text-green-600 border border-green-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <span>Kirim Kwitansi WA</span>
                    </a>
                  ) : (
                    /* Two Actions: Terima Cash & Tagih WA */
                    <>
                      <a
                        href={getWhatsAppReminderUrl(customer, tenant)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[48px] px-3 py-2 rounded-xl bg-white hover:bg-orange-50 active:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                        title="Kirim pengingat WA"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ingatkan WA</span>
                      </a>

                      <button
                        onClick={() => handleTerimaCash(customer)}
                        type="button"
                        className="min-h-[48px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <span>TERIMA CASH</span>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Collapsible Riwayat Pembayaran */}
              <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200">
                <button
                  type="button"
                  onClick={() => setExpandedHistoryCustId(expandedHistoryCustId === customer.id ? null : customer.id)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>
                    {expandedHistoryCustId === customer.id ? 'Sembunyikan Riwayat Bayar' : 'Lihat Riwayat Bayar'}
                  </span>
                </button>

                {expandedHistoryCustId === customer.id && (
                  <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    {getCustomerPaymentHistory(customer.id, customer.name).length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic text-center py-1">
                        Belum ada riwayat transaksi pembayaran tercatat
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {getCustomerPaymentHistory(customer.id, customer.name).map((tx) => (
                          <div key={tx.id} className="py-1.5 flex items-center justify-between text-[11px]">
                            <div>
                              <p className="font-bold text-gray-800">
                                {formatDateIndo(tx.created_at)}
                              </p>
                              <p className="text-[10px] text-gray-500">{tx.notes || 'Iuran Bulanan'}</p>
                            </div>
                            <span className="font-extrabold text-green-600">
                              {formatIDR(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Load More Button for 900 list */}
        {filteredCustomers.length > displayLimit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setDisplayLimit(prev => prev + 30)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-extrabold text-blue-600 shadow-sm hover:bg-gray-50 transition active:scale-95"
            >
              Tampilkan Lebih Banyak ({filteredCustomers.length - displayLimit} lagi)
            </button>
          </div>
        )}
      </div>

      {/* Customer Modal for Add / Edit */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        customer={editingCustomer}
        existingAreas={areas}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        title="Hapus Pelanggan?"
        message={`Apakah Anda yakin ingin menghapus data pelanggan "${customerToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCustomerToDelete(null)}
      />

      {/* POP-UP KWITANSI WA SETELAH TERIMA CASH */}
      {receiptTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-t sm:border-2 border-green-500 rounded-t-[32px] sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-slideUp space-y-4 text-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Uang Cash Diterima!
                  </h3>
                  <p className="text-xs text-green-600 font-semibold">
                    + {formatIDR(receiptTarget.monthly_fee)} Masuk Kas Bisnis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReceiptTarget(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-green-50 rounded-2xl p-3 border border-green-100 text-xs space-y-1.5 text-gray-700">
              <p><b className="text-gray-900">Pelanggan:</b> {receiptTarget.name}</p>
              <p><b className="text-gray-900">Wilayah / Server:</b> {receiptTarget.area}</p>
              <p><b className="text-gray-900">No HP:</b> {receiptTarget.phone}</p>
              <p className="text-[11px] text-green-800 pt-1">
                Status pelanggan otomatis menjadi <b>LUNAS</b> dan mutasi telah dicatat ke kas Bisnis RT/RW.
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={getWhatsAppReceiptUrl(receiptTarget, tenant)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setReceiptTarget(null)}
                className="min-h-[50px] w-full py-3 px-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kirim Bukti Kwitansi ke WhatsApp</span>
              </a>

              <button
                onClick={() => setReceiptTarget(null)}
                type="button"
                className="min-h-[46px] w-full py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition active:scale-95"
              >
                Selesai (Nanti Saja)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENAGIHAN CEPAT VIA WA */}
      {isQuickBillingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-t sm:border-2 border-orange-500 rounded-t-[32px] sm:rounded-3xl p-5 max-w-lg w-full shadow-2xl animate-slideUp space-y-4 text-gray-900 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                    Mode Tagih Cepat via WA
                  </h3>
                  <p className="text-xs text-orange-600 font-semibold">
                    {unpaidCustomers.length} pelanggan belum lunas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickBillingOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50 rounded-2xl p-3 border border-orange-200 text-xs text-orange-950 flex-shrink-0">
              <p className="font-bold text-orange-900 mb-0.5">💡 Tips Penagihan Merakyat:</p>
              <p className="text-[11px] text-orange-800">
                Klik tombol &quot;Kirim WA&quot; di tiap pelanggan. WhatsApp Web/App akan terbuka otomatis dengan format pesan sopan & nomor rekening Anda.
              </p>
            </div>

            {/* List of Unpaid Customers */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-1">
              {unpaidCustomers.map((cust) => {
                const isReminded = remindedCustIds[cust.id];
                return (
                  <div key={cust.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-gray-900 truncate">
                        {cust.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">
                        {cust.area} • <b className="text-gray-900">{formatIDR(cust.monthly_fee)}</b>
                      </p>
                    </div>

                    <a
                      href={getWhatsAppReminderUrl(cust, tenant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setRemindedCustIds(prev => ({ ...prev, [cust.id]: true }))}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 flex-shrink-0 ${
                        isReminded
                          ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                      }`}
                    >
                      {isReminded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Sudah di-WA</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim WA</span>
                        </>
                      )}
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickBillingOpen(false)}
                className="w-full min-h-[46px] py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition active:scale-95 cursor-pointer"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
