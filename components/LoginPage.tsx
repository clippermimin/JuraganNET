'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight,
  Wifi,
  Download,
  Hexagon,
  Zap
} from 'lucide-react';
import { Tenant } from '@/lib/types';

interface LoginPageProps {
  tenants: Tenant[];
  onLoginTenant: (tenantId: string) => boolean;
  onLoginSuperAdmin: (password: string) => boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  tenants,
  onLoginTenant,
  onLoginSuperAdmin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    
    const un = username.trim().toLowerCase();
    
    // Check if Super Admin
    if (un === 'admin' || un === 'admin@juragan.net' || un === 'superadmin') {
      const success = onLoginSuperAdmin(password);
      if (!success) setError(true);
      return;
    }

    // Check if Tenant
    const matchedTenant = tenants.find(
      t => t.id.toLowerCase() === un || 
           t.business_name.toLowerCase() === un || 
           t.owner_name.toLowerCase() === un
    );

    if (matchedTenant) {
      // In a real app, we'd also check password. For now we use demo logic in onLoginTenant
      const success = onLoginTenant(matchedTenant.id);
      if (!success) setError(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Mobile-First Frame */}
      <div className="w-full max-w-md min-h-screen relative flex flex-col bg-gray-50 shadow-2xl border-x border-gray-200">
        
        {/* Top Blue Header (DANA Style) */}
        <div className="absolute top-0 left-0 right-0 h-[280px] bg-blue-600 rounded-b-[40px] z-0 overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-500 rounded-full opacity-50 blur-xl"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col px-5 pt-16 flex-1 animate-fadeIn">
          
          {/* App Logo & Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden group">
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-60"></div>
              
              {/* Inner floating box */}
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative z-10 transform group-hover:scale-105 transition duration-300">
                <Hexagon className="w-10 h-10 text-blue-600 absolute stroke-[1.5]" />
                <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500 relative z-10" />
              </div>
              
              {/* Decorative sparkles */}
              <Sparkles className="w-4 h-4 text-white absolute top-4 right-4 opacity-70" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-blue-400 rounded-full blur-xl opacity-50"></div>
            </div>
            
            <div className="pt-2">
              <h1 className="text-[26px] font-black text-white tracking-tight drop-shadow-md leading-tight">
                JuraganNet
              </h1>
              <p className="text-[11px] text-blue-100 mt-1.5 font-bold drop-shadow-sm tracking-widest uppercase opacity-90">
                Platform CashFlow RT RW Net
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 space-y-6">
            <div className="text-center pb-2">
              <h2 className="text-lg font-black text-gray-900">Selamat Datang</h2>
              <p className="text-xs text-gray-500 mt-1">Silakan masuk untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh : hidupjokowi net"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(false);
                    }}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-bold text-center bg-red-50 py-2.5 px-3 rounded-xl border border-red-100">
                  Login gagal. Pastikan username dan password benar!
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer mt-4"
              >
                <span>LOGIN</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* PWA Install CTA (Minimal) */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                alert("Untuk menginstall PWA:\n\n1. Ketuk ikon Menu (⋮) atau Share di browser.\n2. Pilih 'Tambahkan ke Layar Utama' (Add to Homescreen).");
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-xs font-black transition active:scale-95 border border-blue-100/50"
            >
              <Download className="w-4 h-4" />
              <span>Install PWA</span>
            </button>
          </div>

          {/* Spacer to push footer down */}
          <div className="flex-1 min-h-[40px]"></div>

          {/* Trust Badges & Help */}
          <div className="mt-8 mb-2 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Aman & Terenkripsi</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Cloud Sync</span>
              </div>
            </div>
            
            <button
              onClick={() => alert('Fitur Hubungi CS via WhatsApp (Segera Hadir)')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition"
            >
              Butuh Bantuan? Hubungi Admin
            </button>
          </div>

          {/* Footer */}
          <div className="py-6 text-center">
            <p className="text-[11px] font-semibold text-gray-400">
              JuraganNet by agung5s7 • 2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
