'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, FileText, Check } from 'lucide-react';
import { Customer } from '@/lib/types';

interface CustomerModalProps {
  isOpen: boolean;
  customer?: Customer | null; // If set, edit mode; if null, create mode
  onClose: () => void;
  onSave: (data: Omit<Customer, 'id' | 'tenant_id' | 'is_paid'> | Customer) => void;
}

const PRESET_AREAS = [
  'RW 01 Sindang',
  'RW 02 Cileweun',
  'RW 03 Sukatani',
  'RW 04 Cipinang',
  'RW 05 Kebon Jeruk',
];

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [area, setArea] = useState('RW 04 Cipinang');
  const [customArea, setCustomArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState<number | string>(150000);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      if (PRESET_AREAS.includes(customer.area)) {
        setArea(customer.area);
        setIsCustomArea(false);
      } else {
        setIsCustomArea(true);
        setCustomArea(customer.area);
      }
      setMonthlyFee(customer.monthly_fee);
      setPhone(customer.phone);
      setNotes(customer.notes || '');
    } else {
      setName('');
      setArea('RW 04 Cipinang');
      setIsCustomArea(false);
      setCustomArea('');
      setMonthlyFee(150000);
      setPhone('');
      setNotes('');
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalArea = isCustomArea ? customArea.trim() : area;
    const feeNum = Number(monthlyFee) || 150000;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-md rounded-t-[32px] sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 text-gray-900 shadow-xl animate-slideUp space-y-4">
        
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
                Kelola informasi langganan RT/RW Net
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

          {/* Area / Wilayah */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Wilayah / Area RT-RW <span className="text-red-500">*</span>
            </label>
            {!isCustomArea ? (
              <div className="flex items-center gap-2">
                <select
                  value={area}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomArea(true);
                    } else {
                      setArea(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none"
                >
                  {PRESET_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  <option value="CUSTOM">+ Tambah Wilayah Baru...</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ketik nama wilayah (e.g. RW 06 Sukatani)"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomArea(false)}
                  className="px-4 py-3.5 text-sm font-bold text-slate-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Batal
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
                    type="number"
                    required
                    min={0}
                    step={10000}
                    placeholder="150000"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-sm pointer-events-none">Rp</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">Preset umum: 100.000 / 150.000 / 200.000</p>
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
};
