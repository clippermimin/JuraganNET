'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, MapPin, FileText, Check, Plus, Trash2, Settings2 } from 'lucide-react';
import { Customer } from '@/lib/types';

interface CustomerModalProps {
  isOpen: boolean;
  customer?: Customer | null; // If set, edit mode; if null, create mode
  existingAreas?: string[];
  onClose: () => void;
  onSave: (data: Omit<Customer, 'id' | 'tenant_id' | 'is_paid'> | Customer) => void;
}

const AREAS_STORAGE_KEY = 'juragannet_saved_areas';

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  customer,
  existingAreas = [],
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [isManagingAreas, setIsManagingAreas] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState<number | string>(150000);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved areas from localStorage + existing customer areas
  useEffect(() => {
    if (!isOpen) return;

    let storedAreas: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(AREAS_STORAGE_KEY);
        if (raw) storedAreas = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading saved areas:', err);
      }
    }

    // Combine with passed existingAreas and active customer's area
    const combinedSet = new Set<string>();
    storedAreas.forEach((a) => a && combinedSet.add(a.trim()));
    existingAreas.forEach((a) => a && combinedSet.add(a.trim()));
    if (customer?.area) combinedSet.add(customer.area.trim());

    const merged = Array.from(combinedSet);
    setAreas(merged);

    if (customer) {
      setName(customer.name);
      setArea(customer.area);
      setMonthlyFee(customer.monthly_fee);
      setPhone(customer.phone);
      setNotes(customer.notes || '');
      setIsAddingArea(false);
      setIsManagingAreas(false);
    } else {
      setName('');
      setArea(merged[0] || '');
      setMonthlyFee(150000);
      setPhone('');
      setNotes('');
      setIsAddingArea(merged.length === 0);
      setIsManagingAreas(false);
    }
  }, [customer, isOpen, existingAreas]);

  if (!isOpen) return null;

  // Add new Wilayah / Server
  const handleSaveNewArea = () => {
    const trimmed = newAreaInput.trim();
    if (!trimmed) return;

    const updated = Array.from(new Set([...areas, trimmed]));
    setAreas(updated);
    setArea(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(updated));
    }
    setNewAreaInput('');
    setIsAddingArea(false);
  };

  // Delete Wilayah / Server
  const handleDeleteArea = (targetArea: string) => {
    const updated = areas.filter((a) => a !== targetArea);
    setAreas(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(updated));
    }
    if (area === targetArea) {
      setArea(updated[0] || '');
      if (updated.length === 0) {
        setIsAddingArea(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalArea = area.trim();
    if (isAddingArea) {
      finalArea = newAreaInput.trim();
      if (!finalArea) return;
      // Auto persist new area
      const updated = Array.from(new Set([...areas, finalArea]));
      setAreas(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(updated));
      }
    }

    if (!finalArea) return;

    const feeNum = parseInt(String(monthlyFee).replace(/[^0-9]/g, ''), 10) || 150000;

    if (customer) {
      onSave({
        ...customer,
        name: name.trim(),
        area: finalArea,
        monthly_fee: feeNum,
        phone: phone.trim(),
        notes: notes.trim(),
      });
    } else {
      onSave({
        name: name.trim(),
        area: finalArea,
        monthly_fee: feeNum,
        phone: phone.trim(),
        notes: notes.trim(),
      });
    }
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-md rounded-t-[32px] sm:rounded-3xl max-h-[90vh] overflow-y-auto overscroll-contain p-5 text-gray-900 shadow-xl animate-slideUp space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 leading-tight">
                {customer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Kelola informasi langganan & server RT/RW Net
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nama Pelanggan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nama Pelanggan / Pemilik IP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: Pak Budi / Rum. Budi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Wilayah / Server */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Wilayah / Server <span className="text-red-500">*</span>
              </label>
              {areas.length > 0 && !isAddingArea && (
                <button
                  type="button"
                  onClick={() => setIsManagingAreas((prev) => !prev)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>{isManagingAreas ? 'Selesai Kelola' : 'Kelola / Hapus Wilayah'}</span>
                </button>
              )}
            </div>

            {/* Sub-mode: Manage & Delete Wilayah */}
            {isManagingAreas ? (
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-800">Daftar Wilayah / Server Tersimpan:</span>
                  <button
                    type="button"
                    onClick={() => setIsManagingAreas(false)}
                    className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-lg hover:bg-red-200 transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
                  {areas.map((a) => (
                    <div
                      key={a}
                      className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-bold text-gray-900 shadow-sm"
                    >
                      <span className="truncate max-w-[240px]">{a}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteArea(a)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition active:scale-95 cursor-pointer"
                        title={`Hapus wilayah ${a}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : isAddingArea ? (
              /* Sub-mode: Add New Wilayah Input */
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="Ketik Wilayah / Server (Contoh: Server OLT 01, RW 03)..."
                    value={newAreaInput}
                    onChange={(e) => setNewAreaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewArea();
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-blue-400 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewArea}
                    disabled={!newAreaInput.trim()}
                    className="px-4 py-3 text-xs font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 flex-shrink-0 cursor-pointer"
                  >
                    Simpan
                  </button>
                  {areas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingArea(false);
                        setNewAreaInput('');
                      }}
                      className="px-3 py-3 text-xs font-bold text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  Nama wilayah/server akan otomatis tersimpan untuk pilihan pelanggan berikutnya.
                </p>
              </div>
            ) : areas.length === 0 ? (
              /* Empty State: No areas added yet */
              <div className="p-4 bg-blue-50/60 border border-dashed border-blue-200 rounded-2xl text-center space-y-2">
                <p className="text-xs text-blue-900 font-bold">Belum ada Wilayah / Server yang ditambahkan.</p>
                <button
                  type="button"
                  onClick={() => setIsAddingArea(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Tambah Wilayah / Server Baru
                </button>
              </div>
            ) : (
              /* Normal Dropdown Select */
              <div className="flex items-center gap-2">
                <select
                  value={area}
                  required
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsAddingArea(true);
                    } else {
                      setArea(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                >
                  <option value="" disabled>Pilih Wilayah / Server...</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  <option value="__ADD_NEW__" className="text-blue-600 font-extrabold">
                    + Tambah Wilayah / Server Baru...
                  </option>
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddingArea(true)}
                  className="p-3.5 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 rounded-2xl transition flex-shrink-0 cursor-pointer"
                  title="Tambah Wilayah / Server Baru"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Iuran Bulanan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Iuran Bulanan (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="150.000"
                value={monthlyFee ? Number(String(monthlyFee).replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                onChange={(e) => setMonthlyFee(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-sm pointer-events-none">Rp</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-gray-400 font-medium">Preset Cepat:</span>
              {[100000, 150000, 200000, 250000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonthlyFee(String(preset))}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 font-bold text-[11px] transition active:scale-95 cursor-pointer border border-gray-200"
                >
                  {preset.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Catatan / IP */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Catatan / IP Address / Lokasi (Opsional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Contoh: IP 192.168.1.55 / Paket 10Mbps"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <FileText className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>{customer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
