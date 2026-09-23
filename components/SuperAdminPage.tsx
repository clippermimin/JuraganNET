'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Crown, 
  LogOut,
  Users,
  User,
  Check,
  CreditCard,
  Phone,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';
import { Tenant } from '@/lib/types';
import { formatIDR } from '@/lib/utils';
import { ConfirmModal } from './ConfirmModal';

interface SuperAdminPageProps {
  tenants: Tenant[];
  onAddTenant: (tenantData: Omit<Tenant, 'id' | 'created_at'>) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onDeleteTenant: (id: string) => void;
  onLogout: () => void;
}

export const SuperAdminPage: React.FC<SuperAdminPageProps> = ({
  tenants,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
  onLogout,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Form State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('Pro Single-RW');
  const [monthlyPrice, setMonthlyPrice] = useState<number | string>(150000);
  const [status, setStatus] = useState<'ACTIVE' | 'TRIAL' | 'EXPIRED'>('ACTIVE');
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);

  const resetForm = () => {
    setBusinessName('');
    setOwnerName('');
    setPhone('');
    setPlan('Pro Single-RW');
    setMonthlyPrice(150000);
    setStatus('ACTIVE');
    setEditingTenant(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Tenant) => {
    setBusinessName(t.business_name);
    setOwnerName(t.owner_name);
    setPhone(t.phone || '');
    setPlan(t.plan || 'Pro Single-RW');
    setMonthlyPrice(t.monthly_price ?? 150000);
    setStatus(t.status || 'ACTIVE');
    setEditingTenant(t);
    setIsFormOpen(true);
    setOpenDropdownId(null);
  };

  const handleDeleteClick = (id: string) => {
    setTenantToDelete(id);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (tenantToDelete) {
      onDeleteTenant(tenantToDelete);
    }
    setTenantToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim()) return;

    if (editingTenant) {
      onUpdateTenant({
        ...editingTenant,
        business_name: businessName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        status,
        plan,
        monthly_price: parseInt(String(monthlyPrice).replace(/[^0-9]/g, ''), 10) || 0,
      });
    } else {
      onAddTenant({
        business_name: businessName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        status,
        plan,
        monthly_price: parseInt(String(monthlyPrice).replace(/[^0-9]/g, ''), 10) || 0,
      });
    }
    resetForm();
  };

  const totalMrr = tenants.reduce((sum, t) => sum + (t.status === 'ACTIVE' ? (t.monthly_price || 0) : 0), 0);
  const activeCount = tenants.filter(t => t.status === 'ACTIVE' || !t.status).length;
  const trialCount = tenants.filter(t => t.status === 'TRIAL').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" onClick={() => setOpenDropdownId(null)}>
      
      {/* Admin Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-lg">Portal Super Admin</h1>
              <p className="text-xs text-slate-400">Manajemen Klien & SaaS</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500">Total Klien</p>
              <h3 className="text-xl font-black text-slate-900">{tenants.length}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500">Full Access (Aktif)</p>
              <h3 className="text-xl font-black text-slate-900">{activeCount}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500">Trial (Uji Coba)</p>
              <h3 className="text-xl font-black text-slate-900">{trialCount}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500">MRR (Aktif)</p>
              <h3 className="text-lg font-black text-slate-900">{formatIDR(totalMrr)}</h3>
            </div>
          </div>
        </div>

        {/* Tenant Management Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Section Header */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Data Klien Terdaftar</h2>
              <p className="text-sm text-slate-500">Atur Lisensi Akses, Trial, dan Detail Usaha Klien</p>
            </div>
            {!isFormOpen && (
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenAdd(); }}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-lg shadow-blue-600/30 flex items-center gap-2 transition whitespace-nowrap active:scale-95"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                Tambah Klien Baru
              </button>
            )}
          </div>

          {/* Add / Edit Form */}
          {isFormOpen && (
            <div className="p-5 bg-slate-50 border-b border-slate-200 animate-slideUp">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">{editingTenant ? 'Edit Data Klien' : 'Pendaftaran Klien Baru'}</h3>
                <p className="text-xs text-slate-500">Isi data secara lengkap untuk akses aplikasi Klien.</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Usaha RT/RW Net <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Maju Jaya Net"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Pemilik / Mitra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Pak Budi"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      No WhatsApp Klien
                    </label>
                    <input
                      type="tel"
                      placeholder="0812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Lisensi Akses Aplikasi
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="ACTIVE">✅ Full Access (Aktif)</option>
                      <option value="TRIAL">⏳ Trial (Uji Coba)</option>
                      <option value="EXPIRED">❌ Expired / Suspend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Paket Fitur SaaS
                    </label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Pro Single-RW">Pro Single-RW</option>
                      <option value="Pro Multi-RW">Pro Multi-RW</option>
                      <option value="Enterprise Unlimited">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Biaya Berlangganan / Bulan
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={monthlyPrice ? Number(String(monthlyPrice).replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                      onChange={(e) => setMonthlyPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    {editingTenant ? 'Simpan Perubahan' : 'Simpan Klien Baru'}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="py-4 px-6 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold transition active:scale-95 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tenants Table/List */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Info Klien</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Kontak</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lisensi & Paket</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition group">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{t.business_name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{t.id.slice(0,10)}</div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {t.owner_name}
                      </div>
                      {t.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {t.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          t.status === 'ACTIVE' || !t.status 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : t.status === 'TRIAL'
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {t.status === 'ACTIVE' ? 'FULL ACCESS' : t.status || 'ACTIVE'}
                        </span>
                        <div className="text-xs font-bold text-slate-700 mt-0.5">{t.plan || 'Pro Single-RW'}</div>
                        <div className="text-[11px] text-slate-500">{formatIDR(t.monthly_price || 150000)}/bln</div>
                      </div>
                    </td>
                    <td className="p-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === t.id ? null : t.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === t.id && (
                        <div 
                          className="absolute right-8 top-8 w-40 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-30 animate-fadeIn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-1">
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4 text-slate-400" />
                              <span>Edit Data</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(t.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {tenants.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Belum ada tenant yang terdaftar.
              </div>
            )}
          </div>
        </div>

      </main>

      <ConfirmModal
        isOpen={!!tenantToDelete}
        title="Hapus Klien?"
        message="Yakin ingin menghapus klien ini? Semua data terkait (jika tidak ada di cloud) akan hilang permanen."
        confirmText="Ya, Hapus Klien"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTenantToDelete(null)}
      />
    </div>
  );
};
