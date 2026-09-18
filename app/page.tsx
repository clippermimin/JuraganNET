'use client';

import React, { useState } from 'react';
import { useJuraganStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { BusinessTab } from '@/components/BusinessTab';
import { PersonalTab } from '@/components/PersonalTab';
import { CustomerPage } from '@/components/CustomerPage';
import { BottomNav } from '@/components/BottomNav';
import { TransactionModal } from '@/components/TransactionModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ExportModal } from '@/components/ExportModal';
import { SuperAdminPage } from '@/components/SuperAdminPage';
import { LoginPage } from '@/components/LoginPage';
import { PwaPrompt } from '@/components/PwaPrompt';
import { GreetingBanner } from '@/components/GreetingBanner';
import { Building2, Home, Sparkles, FileSpreadsheet, FileText, Download, Hexagon, Zap } from 'lucide-react';
import { TransactionType, AccountType, Transaction } from '@/lib/types';

export default function HomeApp() {
  const {
    isLoaded,
    currentUserRole,
    loginAsTenant,
    loginAsSuperAdmin,
    logout,
    tenant,
    tenants,
    setTenant,
    addTenant,
    updateTenant,
    deleteTenant,
    switchTenant,
    selectedMonth,
    setSelectedMonth,
    transactions,
    customers,
    bills,
    businessSummary,
    personalSummary,
    setSalaryBudget,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    receiveCustomerPayment,
    payRecurringBill,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    resetToFactoryDefault,
  } = useJuraganStore();

  // Navigation State
  const [activeNavTab, setActiveNavTab] = useState<'DASHBOARD' | 'CUSTOMERS' | 'SETTINGS'>('DASHBOARD');
  // Main Switcher on Dashboard: Business vs Personal
  const [dashboardMode, setDashboardMode] = useState<'BUSINESS' | 'PERSONAL'>('BUSINESS');

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('IN');
  const [txModalAccount, setTxModalAccount] = useState<AccountType>('BUSINESS');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Settings & Export Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Handlers
  const handleOpenTransaction = (type: TransactionType, account?: AccountType, transaction?: Transaction) => {
    if (transaction) {
      setEditingTx(transaction);
      setTxModalType(transaction.type);
      setTxModalAccount(transaction.account);
    } else {
      setEditingTx(null);
      setTxModalType(type);
      setTxModalAccount(account || (dashboardMode === 'BUSINESS' ? 'BUSINESS' : 'PERSONAL'));
    }
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (
    type: TransactionType,
    account: AccountType,
    category: string,
    amount: number,
    notes?: string,
    id?: string
  ) => {
    if (id && editingTx) {
      updateTransaction({
        ...editingTx,
        type,
        account,
        category,
        amount,
        notes: notes || ''
      });
    } else {
      addTransaction(type, account, category, amount, notes);
    }
  };

  const handleConfirmDeleteTx = (id: string) => {
    deleteTransaction(id);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 p-4">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative animate-pulse mb-6">
          <Hexagon className="w-10 h-10 text-blue-600 absolute stroke-[1.5]" />
          <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500 relative z-10" />
        </div>
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Memuat JuraganNet...</h2>
        <p className="text-[11px] text-slate-500 mt-1.5 animate-pulse">Menyiapkan data kas & pelanggan</p>
      </div>
    );
  }

  // Not Logged In -> Show Login Page
  if (currentUserRole === null) {
    return (
      <LoginPage
        tenants={tenants}
        onLoginTenant={loginAsTenant}
        onLoginSuperAdmin={loginAsSuperAdmin}
      />
    );
  }

  // Super Admin Route -> Show Admin Panel bypassing the app UI
  if (currentUserRole === 'SUPER_ADMIN') {
    return (
      <SuperAdminPage 
        tenants={tenants} 
        onAddTenant={addTenant} 
        onUpdateTenant={updateTenant}
        onDeleteTenant={deleteTenant}
        onLogout={logout} 
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Mobile-First Frame: max-w-md mx-auto */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-gray-50 shadow-2xl border-x border-gray-200">
        
        {/* PWA Add to Homescreen Prompt */}
        <PwaPrompt />

        {/* Top Sticky Header */}
        <Header
          tenant={tenant}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 px-3.5 pt-3.5">
          {activeNavTab === 'DASHBOARD' && (
            <div className="space-y-4 animate-fadeIn">
              
              <GreetingBanner ownerName={tenant.owner_name} />

              {/* SWITCHER TAB UTAMA (UKURAN BESAR & KONTRAS TINGGI) */}
              <div className="bg-gray-200 p-1.5 rounded-3xl border border-gray-300 grid grid-cols-2 gap-1.5 shadow-inner">
                {/* Tab Bisnis RT/RW */}
                <button
                  onClick={() => setDashboardMode('BUSINESS')}
                  type="button"
                  className={`min-h-[52px] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                    dashboardMode === 'BUSINESS'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-300/50'
                  }`}
                >
                  <Building2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Bisnis</span>
                </button>

                {/* Tab Pribadi / Keluarga */}
                <button
                  onClick={() => setDashboardMode('PERSONAL')}
                  type="button"
                  className={`min-h-[52px] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                    dashboardMode === 'PERSONAL'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-300/50'
                  }`}
                >
                  <Home className="w-4 h-4 stroke-[2.5]" />
                  <span>Pribadi</span>
                </button>
              </div>

              {/* View Content depending on Mode */}
              {dashboardMode === 'BUSINESS' ? (
                <BusinessTab
                  summary={businessSummary}
                  bills={bills}
                  recentTransactions={transactions}
                  onPayBill={payRecurringBill}
                  onOpenCustomerList={() => setActiveNavTab('CUSTOMERS')}
                  onQuickRecord={(type, account) => handleOpenTransaction(type, account)}
                  onAddBill={addRecurringBill}
                  onUpdateBill={updateRecurringBill}
                  onDeleteBill={deleteRecurringBill}
                  onEditTransaction={(tx) => handleOpenTransaction(tx.type, tx.account, tx)}
                  onDeleteTransaction={handleConfirmDeleteTx}
                />
              ) : (
                <PersonalTab
                  summary={personalSummary}
                  recentTransactions={transactions}
                  onUpdateSalary={setSalaryBudget}
                  onEditTransaction={(tx) => handleOpenTransaction(tx.type, tx.account, tx)}
                  onDeleteTransaction={handleConfirmDeleteTx}
                />
              )}

            </div>
          )}

          {activeNavTab === 'CUSTOMERS' && (
            <div className="animate-fadeIn">
              <CustomerPage
                customers={customers}
                tenant={tenant}
                onReceivePayment={receiveCustomerPayment}
                onBackToDashboard={() => setActiveNavTab('DASHBOARD')}
                onAddCustomer={addCustomer}
                onUpdateCustomer={updateCustomer}
                onDeleteCustomer={deleteCustomer}
              />
            </div>
          )}

          {activeNavTab === 'SETTINGS' && (
            <div className="py-4 space-y-4 animate-fadeIn">
              <div className="bg-white border border-gray-200 rounded-3xl p-5 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Building2 className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-black text-gray-900">{tenant.business_name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Pemilik: {tenant.owner_name}</p>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="min-h-[48px] w-full py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Laporan Excel & PDF ({selectedMonth})</span>
                  </button>

                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="min-h-[48px] w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs active:scale-95 transition"
                  >
                    Kelola Nama Usaha Tenant & Cloud Supabase
                  </button>

                  <button
                    onClick={() => setActiveNavTab('DASHBOARD')}
                    className="min-h-[44px] w-full py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 font-semibold text-xs active:scale-95 transition"
                  >
                    Kembali ke Dashboard Utama
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Bar: Huge Action Buttons + Navigation */}
        <BottomNav
          currentTab={activeNavTab}
          onSelectTab={(tab) => {
            if (tab === 'SETTINGS') {
              setIsSettingsOpen(true);
            } else {
              setActiveNavTab(tab);
            }
          }}
          onOpenTransaction={handleOpenTransaction}
          unpaidCount={businessSummary.unpaidCustomers}
        />

        {/* Modal Catat Uang Masuk / Keluar */}
        <TransactionModal
          isOpen={isTxModalOpen}
          initialType={txModalType}
          initialAccount={txModalAccount}
          editingTransaction={editingTx}
          onClose={() => {
            setIsTxModalOpen(false);
            setEditingTx(null);
          }}
          onSave={handleSaveTransaction}
        />

        {/* Modal Kelola Tenant & Supabase */}
        <SettingsModal
          isOpen={isSettingsOpen}
          tenant={tenant}
          businessSummary={businessSummary}
          personalSummary={personalSummary}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateTenant={setTenant}
          onResetFactory={resetToFactoryDefault}
          onOpenExport={() => setIsExportOpen(true)}
          onLogout={logout}
        />

        {/* Modal Ekspor Laporan Bulanan (Excel & PDF) */}
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          tenant={tenant}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          businessSummary={businessSummary}
          personalSummary={personalSummary}
          transactions={transactions}
          customers={customers}
          bills={bills}
        />

      </div>
    </main>
  );
}
