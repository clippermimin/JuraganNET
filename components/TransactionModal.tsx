'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  User, 
  Check,
  Sparkles,
  Delete
} from 'lucide-react';
import { AccountType, TransactionType, Transaction } from '@/lib/types';
import { formatIDR, parseVoiceInput } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface TransactionModalProps {
  isOpen: boolean;
  initialType: TransactionType;
  initialAccount?: AccountType;
  editingTransaction?: Transaction | null;
  onClose: () => void;
  onSave: (
    type: TransactionType,
    account: AccountType,
    category: string,
    amount: number,
    notes?: string,
    id?: string
  ) => void;
}

const CATEGORIES_MAP = {
  IN: {
    BUSINESS: [
      'Iuran Bulanan Warga',
      'Pasang Baru (PSB)',
      'Setoran Voucher WiFi',
      'Jual Router / Alat',
      'Servis / Tarik Kabel',
      'Pemasukan Lainnya',
    ],
    PERSONAL: [
      'Ambil Gaji Bisnis',
      'Bagi Hasil / Bonus',
      'Kerja Sampingan',
      'Titipan / Kiriman',
      'Pemasukan Lainnya',
    ],
  },
  OUT: {
    BUSINESS: [
      'Router & ONT Pelanggan',
      'Kabel FO & Dropcore',
      'Bensin Lapangan',
      'Makan & Kopi Teknisi',
      'Bayar ISP / Bandwidth',
      'Gaji Tim Lapangan',
      'Listrik Server & OLT',
      'Sewa Tiang & Kas RT/RW',
      'Tools & Alat Kerja',
      'Operasional Mendadak',
      'Lain-lain Bisnis',
    ],
    PERSONAL: [
      'Indomaret / Warung',
      'Makan & Minum',
      'Rokok & Kopi',
      'Beras & Dapur',
      'Uang Jajan Anak',
      'Bensin Motor',
      'Pulsa & Game',
      'Listrik Rumah',
      'Cicilan & Arisan',
      'Kondangan & Sedekah',
      'Lain-lain Pribadi',
    ],
  },
};

const QUICK_AMOUNTS = [50000, 100000, 150000, 250000, 500000, 1000000];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialType,
  initialAccount = 'BUSINESS',
  editingTransaction = null,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [account, setAccount] = useState<AccountType>(initialAccount);
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechFeedback, setSpeechFeedback] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAccount(editingTransaction.account);
        setAmountStr(String(editingTransaction.amount));
        setCategory(editingTransaction.category);
        setNotes(editingTransaction.notes || '');
      } else {
        setType(initialType);
        setAccount(initialAccount);
        setAmountStr('');
        setNotes('');
        const defaultCats = CATEGORIES_MAP[initialType][initialAccount];
        setCategory(defaultCats[0] || '');
      }
      setSpeechFeedback('');
    }
  }, [isOpen, initialType, initialAccount, editingTransaction]);

  // When account or type changes, adjust default category
  const handleAccountChange = (newAcc: AccountType) => {
    setAccount(newAcc);
    const availableCats = CATEGORIES_MAP[type][newAcc];
    if (!availableCats.includes(category)) {
      setCategory(availableCats[0] || '');
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const availableCats = CATEGORIES_MAP[newType][account];
    if (!availableCats.includes(category)) {
      setCategory(availableCats[0] || '');
    }
  };

  const parsedAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;

  const handleQuickAdd = (addVal: number) => {
    const current = parsedAmount;
    setAmountStr(String(current + addVal));
  };

  // Web Speech API Voice Recognition (id-ID)
  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
                      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Browser Anda belum mendukung Speech Recognition. Silakan gunakan Google Chrome di HP/Laptop.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechFeedback('Mendengarkan suara Anda dalam Bahasa Indonesia...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechFeedback(`Terdengar: "${transcript}"`);
        setNotes(prev => (prev ? `${prev}, ${transcript}` : transcript));

        // Smart parse transcript for numbers and category
        const parsed = parseVoiceInput(transcript);
        if (parsed.amount && parsed.amount > 0) {
          setAmountStr(String(parsed.amount));
        }
        if (parsed.category) {
          const available = CATEGORIES_MAP[type][account];
          if (available.includes(parsed.category)) {
            setCategory(parsed.category);
          }
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setSpeechFeedback('Gagal mendengar suara. Silakan coba lagi.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert('Silakan masukkan nominal uang yang valid!');
      return;
    }

    if (type === 'IN') {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    onSave(type, account, category || 'Lain-lain', parsedAmount, notes, editingTransaction?.id);
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = CATEGORIES_MAP[type][account];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-md rounded-t-[32px] sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 text-gray-900 shadow-xl animate-slideUp">
        
        {/* Header with Type & Close */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {type === 'IN' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight text-gray-900">
                {editingTransaction ? 'Edit Transaksi' : type === 'IN' ? 'Catat Uang Masuk' : 'Catat Uang Keluar'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {editingTransaction ? 'Perbaiki catatan transaksi' : 'Input cepat minim ketikan'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* 1. Account Selector (Bisnis RT/RW vs Pribadi) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Simpan ke Akun Mana?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAccountChange('BUSINESS')}
                className={`min-h-[48px] p-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border ${
                  account === 'BUSINESS'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Kas Bisnis RT/RW</span>
              </button>

              <button
                type="button"
                onClick={() => handleAccountChange('PERSONAL')}
                className={`min-h-[48px] p-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border ${
                  account === 'PERSONAL'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Pribadi / Rumah</span>
              </button>
            </div>
          </div>

          {/* 2. Big Nominal Display & Input */}
          <div className="bg-gray-50 rounded-3xl p-4 border border-gray-200 text-center">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Jumlah Uang (Rupiah)
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className={`text-xl font-bold ${type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={parsedAmount > 0 ? parsedAmount.toLocaleString('id-ID') : amountStr}
                onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className={`w-full text-center text-3xl sm:text-4xl font-black bg-transparent outline-none tracking-tight ${
                  type === 'IN' ? 'text-green-600' : 'text-red-600'
                }`}
                autoFocus
              />
            </div>

            {/* Quick Amount Increment Chips */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-gray-200">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="min-h-[38px] px-2.5 py-1 rounded-xl bg-white hover:bg-gray-100 text-[11px] font-bold text-gray-700 border border-gray-200 active:scale-95"
                >
                  +{amt >= 1000000 ? `${amt / 1000000}Jt` : `${amt / 1000}Rb`}
                </button>
              ))}
              {parsedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="min-h-[38px] px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-[11px] font-bold text-red-600 border border-red-100 flex items-center gap-1"
                >
                  <Delete className="w-3 h-3" /> Hapus
                </button>
              )}
            </div>
          </div>

          {/* 3. Category Chips & Custom Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700">
                Kategori Transaksi:
              </label>
              {category && (
                <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  Dipilih: {category}
                </span>
              )}
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {currentCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 border cursor-pointer ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Optional Custom Category Field */}
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Atau ketik nama kategori sendiri..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 4. Notes & Web Speech Voice Recognition */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="tx-notes" className="text-xs font-bold text-gray-700">
                Catatan Bebas:
              </label>

              {/* Voice-to-Text Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`min-h-[38px] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Mendengarkan...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Input Suara (Bicara)</span>
                  </>
                )}
              </button>
            </div>

            <input
              id="tx-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isListening ? 'Silakan bicara sekarang...' : 'Contoh: beli bensin, titipan nene, dropcore glodok...'}
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />

            {speechFeedback && (
              <p className="text-[11px] text-orange-600 mt-1 italic flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {speechFeedback}
              </p>
            )}
          </div>

          {/* 5. Big Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className={`w-full py-4 px-4 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
                type === 'IN'
                  ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-green-600/30'
                  : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-red-600/30'
              }`}
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{editingTransaction ? 'SIMPAN PERUBAHAN' : `SIMPAN ${type === 'IN' ? 'UANG MASUK' : 'UANG KELUAR'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
