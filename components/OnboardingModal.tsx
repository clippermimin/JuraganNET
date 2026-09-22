'use client';

import React, { useState } from 'react';
import { Users, CheckCircle2, TrendingUp, ArrowRight, ArrowLeft, Check, Sparkles, X, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ONBOARDING_STEPS = [
  {
    step: 1,
    badge: 'Langkah 1 dari 3',
    icon: Users,
    iconColor: 'bg-blue-50 text-blue-600 border-blue-200',
    title: 'Masukkan Data Pelanggan',
    subtitle: 'Mulai dengan menambahkan nama warga / tetangga yang berlangganan internet.',
    points: [
      'Isi Nama, Nomor WhatsApp, dan Biaya Iuran Bulanan.',
      'Tentukan Wilayah / Server (misal: RW 01, Server Utama, atau Blok A).',
      'Data tersimpan rapi dan dapat disinkronkan ke cloud secara otomatis.',
    ],
    tip: '💡 Klik tombol biru "+ Tambah" di menu Data Pelanggan kapan saja untuk menambah pelanggan baru.',
  },
  {
    step: 2,
    badge: 'Langkah 2 dari 3',
    icon: CheckCircle2,
    iconColor: 'bg-green-50 text-green-600 border-green-200',
    title: 'Terima Iuran & Kwitansi WA 1 Ketukan',
    subtitle: 'Catat pembayaran secepat kilat tanpa perlu kwitansi kertas manual.',
    points: [
      'Ketika pelanggan bayar, cukup tekan "TERIMA CASH".',
      'Sistem otomatis mencatat pemasukan kas & menandai status LUNAS.',
      'Langsung muncul pop-up kirim Bukti Kwitansi resmi ke WhatsApp pelanggan.',
      'Gunakan "Mode Tagih Cepat" untuk mengingatkan warga yang belum bayar.',
    ],
    tip: '💡 Pelanggan senang karena langsung menerima pesan bukti lunas di WhatsApp mereka!',
  },
  {
    step: 3,
    badge: 'Langkah 3 dari 3',
    icon: TrendingUp,
    iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'Pantau Cuan & Kas Bisnis Terpisah',
    subtitle: 'Ketahui laba bersih pasti dan lindungi dompet keluarga Anda.',
    points: [
      'Lihat Keuntungan Bersih (Cuan Bersih) bulan ini di layar utama.',
      'Catat biaya operasional rutin (ISP grosir, listrik server, sewa tiang).',
      'Pisahkan Kas Bisnis vs Kas Pribadi — jangan sampai uang usaha terpakai belanja dapur!',
      'Ekspor laporan keuangan ke format Excel & PDF kapan saja diperlukan.',
    ],
    tip: '💡 JuraganNet dirancang khusus agar mudah digunakan oleh siapa saja, bahkan yang merasa gaptek sekalipun.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('juragannet_onboarding_done', 'true');
      }
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('juragannet_onboarding_done', 'true');
    }
    onClose();
  };

  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 rounded-t-[32px] sm:rounded-3xl p-6 max-w-md w-full shadow-2xl animate-slideUp space-y-5 text-gray-900">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            <Sparkles className="w-3 h-3" />
            {currentStep.badge}
          </span>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-xs font-semibold p-1"
          >
            Lewati
          </button>
        </div>

        {/* Step Visual Content */}
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center border ${currentStep.iconColor}`}>
            <StepIcon className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Step Key Points */}
        <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 space-y-2 text-xs">
          {currentStep.points.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <p className="text-gray-700 leading-tight">{point}</p>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-gray-200/60 text-[11px] font-semibold text-gray-600">
            {currentStep.tip}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStepIndex ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-1">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="min-h-[48px] px-4 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[48px] flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <span>{isLastStep ? 'Siap, Mulai Kelola Sekarang!' : 'Lanjut'}</span>
            {isLastStep ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
