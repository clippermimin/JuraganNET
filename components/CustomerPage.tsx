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
  ChevronDown,
  ChevronUp,
  LayoutList,
  LayoutGrid,
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
  const [isCompactView, setIsCompactView] = useState(true);
  const [expandedCardCustId, setExpandedCardCustId] = useState<string | null>(null);

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
    <div className="space-y-2.5 pb-24">
      {/* Header Info - Compact & Modern */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                Daftar Pelanggan
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Pencatatan iuran & kirim kuitansi WA
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition active:scale-95 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Counter Badges - Sleek Chips */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-gray-50/80 rounded-xl py-1.5 px-2 text-center border border-gray-200/60">
            <span className="text-[10px] text-gray-500 font-medium block leading-none">Total</span>
            <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">{totalCount}</span>
          </div>
          <div className="bg-emerald-50/80 rounded-xl py-1.5 px-2 text-center border border-emerald-200/60">
            <span className="text-[10px] text-emerald-700 font-medium block leading-none">Lunas</span>
            <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">{paidCount}</span>
          </div>
          <div className="bg-rose-50/80 rounded-xl py-1.5 px-2 text-center border border-rose-200/60">
            <span className="text-[10px] text-rose-700 font-medium block leading-none">Belum</span>
            <span className="text-sm font-extrabold text-rose-600 mt-0.5 block">{unpaidCount}</span>
          </div>
        </div>

        {/* Quick Billing Action Button */}
        {unpaidCount > 0 && (
          <button
            onClick={() => setIsQuickBillingOpen(true)}
            type="button"
            className="w-full mt-2 min-h-[36px] py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-700 active:to-amber-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Tagih Cepat via WA ({unpaidCount} Belum Bayar)</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="space-y-1.5">
        {/* Search Input & View Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <label htmlFor="customer-search" className="sr-only">Cari Nama Pelanggan / No HP</label>
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="customer-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelanggan, HP, wilayah..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-gray-50/90 border border-gray-200 text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Density Toggle Button */}
          <button
            onClick={() => setIsCompactView(!isCompactView)}
            type="button"
            className={`min-h-[36px] px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition active:scale-95 flex-shrink-0 cursor-pointer ${
              isCompactView 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            title={isCompactView ? "Mode Rapat (Aktif)" : "Mode Renggang"}
          >
            {isCompactView ? <LayoutList className="w-3.5 h-3.5 text-blue-600" /> : <LayoutGrid className="w-3.5 h-3.5 text-gray-500" />}
            <span className="hidden sm:inline">{isCompactView ? 'Rapat' : 'Detail'}</span>
          </button>
        </div>

        {/* Area Filter Horizontal Scroll */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedArea('ALL')}
            className={`min-h-[30px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition active:scale-95 flex-shrink-0 text-xs ${
              selectedArea === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Semua Wilayah
          </button>
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`min-h-[30px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition active:scale-95 flex-shrink-0 text-xs ${
                selectedArea === area
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs - Segmented Pill Bar */}
        <div className="grid grid-cols-3 gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-200/60">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`min-h-[32px] rounded-lg font-bold text-xs transition ${
              statusFilter === 'ALL'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Semua ({filteredCustomers.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`min-h-[32px] rounded-lg font-bold text-xs transition ${
              statusFilter === 'UNPAID'
                ? 'bg-red-50 text-red-700 border border-red-200/80 shadow-2xs'
                : 'text-gray-500 hover:text-red-600'
            }`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`min-h-[32px] rounded-lg font-bold text-xs transition ${
              statusFilter === 'PAID'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            Lunas
          </button>
        </div>
      </div>

      {/* Customer List Items */}
      <div className="space-y-1.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-2xs">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-gray-700">Tidak ada pelanggan ditemukan</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Coba sesuaikan kata kunci pencarian atau filter wilayah</p>
          </div>
        ) : (
          filteredCustomers.slice(0, displayLimit).map((customer) => {
            const isExpanded = expandedCardCustId === customer.id;
            
            return (
              <div
                key={customer.id}
                className={`rounded-xl border transition-all ${
                  customer.is_paid
                    ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200'
                    : 'bg-white border-gray-200/80 shadow-2xs hover:border-blue-200'
                } ${isCompactView ? 'p-2.5 sm:p-3' : 'p-3.5'}`}
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-2.5">
                  {/* Left Column: Clickable Name & Details */}
                  <div 
                    onClick={() => setExpandedCardCustId(isExpanded ? null : customer.id)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none active:opacity-75 transition-opacity group"
                    role="button"
                    tabIndex={0}
                    title="Klik untuk buka detail & riwayat"
                  >
                    {/* Compact Avatar Initial */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-2xs transition-colors ${
                      customer.is_paid
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60 group-hover:bg-blue-100'
                    }`}>
                      {customer.name.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Line 1: Full Customer Name (Untruncated) */}
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {customer.name}
                        </h4>
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                      </div>

                      {/* Line 2: Nominal Tagihan • Area • HP */}
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                        <span className={`font-extrabold ${customer.is_paid ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {formatIDR(customer.monthly_fee)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="inline-flex items-center gap-0.5 text-gray-600 font-medium truncate">
                          <MapPin className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{customer.area}</span>
                        </span>
                        {customer.phone && (
                          <>
                            <span className="text-gray-300 hidden xs:inline">•</span>
                            <span className="font-mono text-[10px] text-gray-400 items-center gap-0.5 hidden xs:inline-flex flex-shrink-0">
                              <Phone className="w-2.5 h-2.5 flex-shrink-0" />
                              <span>{customer.phone}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Cluster */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {customer.is_paid ? (
                      <>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Lunas</span>
                        </span>

                        {customer.phone && (
                          <a
                            href={getWhatsAppReceiptUrl(customer, tenant)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[28px] px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95"
                            title="Kirim Kuitansi WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span className="hidden sm:inline">Kuitansi</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        {customer.phone && (
                          <a
                            href={getWhatsAppReminderUrl(customer, tenant)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[30px] w-7 h-7 sm:w-auto sm:px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-600 border border-orange-200 text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95"
                            title="Kirim Tagihan WhatsApp"
                          >
                            <Send className="w-3 h-3" />
                            <span className="hidden sm:inline">Tagih</span>
                          </a>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTerimaCash(customer);
                          }}
                          type="button"
                          className="min-h-[30px] px-2.5 sm:px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-2xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Bayar</span>
                        </button>
                      </>
                    )}

                    {/* More Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuCustId(activeMenuCustId === customer.id ? null : customer.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition active:scale-95 cursor-pointer"
                        title="Menu Opsi"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Floating Action Menu */}
                      {activeMenuCustId === customer.id && (
                        <div className="absolute right-0 top-7 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-1 w-36 animate-fadeIn">
                          <button
                            onClick={() => {
                              setActiveMenuCustId(null);
                              handleOpenEditModal(customer);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-1.5 transition"
                          >
                            <Pencil className="w-3 h-3 text-blue-500" />
                            <span>Edit Data</span>
                          </button>
                          {customer.is_paid && onUnpayPayment && (
                            <button
                              onClick={() => {
                                setActiveMenuCustId(null);
                                onUnpayPayment(customer);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-orange-600 hover:bg-orange-50 flex items-center gap-1.5 transition"
                            >
                              <RotateCcw className="w-3 h-3 text-orange-500" />
                              <span>Batalkan Lunas</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveMenuCustId(null);
                              handleDeleteCust(customer);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Detail Panel (Opens on click) */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-xs space-y-2 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {/* Alamat / Catatan */}
                      <div className="p-2 bg-gray-50 rounded-lg text-[11px]">
                        <span className="font-semibold block text-[10px] uppercase tracking-wider text-gray-400">Alamat & Catatan</span>
                        <span className="text-gray-800 font-medium">
                          {customer.notes ? customer.notes : `${customer.area} (Belum ada catatan detail)`}
                        </span>
                      </div>

                      {/* Kontak WhatsApp */}
                      <div className="p-2 bg-gray-50 rounded-lg text-[11px] flex items-center justify-between">
                        <div>
                          <span className="font-semibold block text-[10px] uppercase tracking-wider text-gray-400">Kontak WhatsApp</span>
                          <span className="font-mono text-gray-800 font-bold">{customer.phone || 'Belum ada nomor HP'}</span>
                        </div>
                        {customer.phone && (
                          <a
                            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold hover:bg-emerald-200 transition"
                          >
                            Chat WA
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Riwayat Pembayaran */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-1">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3 text-blue-500" /> Riwayat Pembayaran:
                        </span>
                      </div>

                      {getCustomerPaymentHistory(customer.id, customer.name).length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic py-1 bg-gray-50 rounded-lg text-center">
                          Belum ada riwayat transaksi pembayaran tercatat
                        </p>
                      ) : (
                        <div className="divide-y divide-gray-100 bg-gray-50/90 rounded-lg p-1.5">
                          {getCustomerPaymentHistory(customer.id, customer.name).map((tx) => (
                            <div key={tx.id} className="py-1 flex items-center justify-between text-[10px]">
                              <div>
                                <span className="font-semibold text-gray-700">
                                  {formatDateIndo(tx.created_at)}
                                </span>
                                <span className="text-gray-400 ml-1">({tx.notes || 'Iuran'})</span>
                              </div>
                              <span className="font-bold text-emerald-600">
                                {formatIDR(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Edit inside card */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-dashed border-gray-200/80">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(customer);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit Data Pelanggan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {filteredCustomers.length > displayLimit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setDisplayLimit(prev => prev + 30)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-blue-600 shadow-2xs hover:bg-gray-50 transition active:scale-95"
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
