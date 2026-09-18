'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Customer, RecurringBill, Tenant, Transaction, BusinessSummary, PersonalSummary, UserRole, UserSession } from './types';
import { DEFAULT_TENANT, INITIAL_TENANTS, INITIAL_RECURRING_BILLS, INITIAL_TRANSACTIONS, generateMockCustomers } from './mockData';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEYS = {
  TENANT: 'juragannet_tenant',
  TENANTS_LIST: 'juragannet_tenants_list',
  TRANSACTIONS: 'juragannet_transactions',
  CUSTOMERS: 'juragannet_customers',
  BILLS: 'juragannet_bills',
  SALARY_BUDGET: 'juragannet_salary_budget',
  SESSION: 'juragannet_auth_session',
};

export function useJuraganStore() {
  const [tenant, setTenant] = useState<Tenant>(DEFAULT_TENANT);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [session, setSession] = useState<UserSession>({ role: null });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [salaryBudget, setSalaryBudget] = useState<number>(5000000);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('September 2026');

  // Load initial data from Supabase (or fallback to localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadData = async () => {
      try {
        let loadedFromSupabase = false;
        const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (storedSession) setSession(JSON.parse(storedSession));

        if (isSupabaseConfigured && supabase) {
          try {
            const [
              { data: tData },
              { data: cData },
              { data: txData },
              { data: bData }
            ] = await Promise.all([
              supabase.from('tenants').select('*'),
              supabase.from('customers').select('*').order('name', { ascending: true }),
              supabase.from('transactions').select('*').order('created_at', { ascending: false }),
              supabase.from('recurring_bills').select('*')
            ]);

            if (tData && tData.length > 0) {
              setTenants(tData);
              const currentTenantId = JSON.parse(storedSession || '{}')?.tenantId;
              const activeT = tData.find((t: any) => t.id === currentTenantId) || tData[0];
              if (activeT) setTenant(activeT);
            } else if (tData && tData.length === 0) {
              // Empty database, maybe first run. Keep defaults.
              setTenants(INITIAL_TENANTS);
            }

            if (cData) setCustomers(cData);
            if (txData) setTransactions(txData);
            if (bData) setBills(bData);

            loadedFromSupabase = true;
          } catch (e) {
            console.error('Failed fetching from Supabase, falling back to local:', e);
          }
        }

        if (!loadedFromSupabase) {
          const storedTenant = localStorage.getItem(STORAGE_KEYS.TENANT);
          const storedTenantsList = localStorage.getItem(STORAGE_KEYS.TENANTS_LIST);
          const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
          const storedCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
          const storedBills = localStorage.getItem(STORAGE_KEYS.BILLS);

          if (storedTenant) setTenant(JSON.parse(storedTenant));
          if (storedTenantsList) {
            setTenants(JSON.parse(storedTenantsList));
          } else {
            localStorage.setItem(STORAGE_KEYS.TENANTS_LIST, JSON.stringify(INITIAL_TENANTS));
          }
          
          if (storedTx) {
            setTransactions(JSON.parse(storedTx));
          } else {
            setTransactions(INITIAL_TRANSACTIONS);
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
          }

          if (storedCust) {
            setCustomers(JSON.parse(storedCust));
          } else {
            const initialCust = generateMockCustomers();
            setCustomers(initialCust);
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCust));
          }

          if (storedBills) {
            setBills(JSON.parse(storedBills));
          } else {
            setBills(INITIAL_RECURRING_BILLS);
            localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_RECURRING_BILLS));
          }
        }

        const storedSalary = localStorage.getItem(STORAGE_KEYS.SALARY_BUDGET);
        if (storedSalary) {
          setSalaryBudget(Number(storedSalary));
        }
      } catch (err) {
        console.error('Failed to load local storage data:', err);
        setTransactions(INITIAL_TRANSACTIONS);
        setCustomers(generateMockCustomers());
        setBills(INITIAL_RECURRING_BILLS);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save changes to localStorage
  const saveTransactions = useCallback((newTx: Transaction[]) => {
    setTransactions(newTx);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTx));
    }
  }, []);

  const saveCustomers = useCallback((newCust: Customer[]) => {
    setCustomers(newCust);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(newCust));
    }
  }, []);

  const saveBills = useCallback((newBills: RecurringBill[]) => {
    setBills(newBills);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(newBills));
    }
  }, []);

  const saveTenant = useCallback((newTenant: Tenant) => {
    setTenant(newTenant);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(newTenant));
    }
  }, []);

  const saveSalaryBudget = useCallback((budget: number) => {
    setSalaryBudget(budget);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SALARY_BUDGET, String(budget));
    }
  }, []);

  // Action: Add Transaction
  const addTransaction = useCallback((
    type: 'IN' | 'OUT',
    account: 'BUSINESS' | 'PERSONAL',
    category: string,
    amount: number,
    notes?: string,
    customerId?: string
  ) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      tenant_id: tenant.id,
      type,
      account,
      category,
      amount,
      notes: notes || '',
      customer_id: customerId,
      created_at: new Date().toISOString(),
    };

    saveTransactions([newTx, ...transactions]);

    // Background sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').insert([newTx]).then(({ error }) => {
        if (error) console.error('Supabase sync error for transaction:', error);
      });
    }

    return newTx;
  }, [tenant.id, transactions, saveTransactions]);

  // Action: Update Transaction
  const updateTransaction = useCallback((updatedTx: Transaction) => {
    const updated = transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    saveTransactions(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').update(updatedTx).eq('id', updatedTx.id).then(({ error }) => {
        if (error) console.error('Supabase sync error for update transaction:', error);
      });
    }
  }, [transactions, saveTransactions]);

  // Action: Delete Transaction
  const deleteTransaction = useCallback((id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactions(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase sync error for delete transaction:', error);
      });
    }
  }, [transactions, saveTransactions]);

  // Action: One-Tap Receive Cash for Customer
  const receiveCustomerPayment = useCallback((customer: Customer) => {
    // 1. Mark customer as paid
    const updatedCustomers = customers.map(c => 
      c.id === customer.id 
        ? { ...c, is_paid: true, updated_at: new Date().toISOString() } 
        : c
    );
    saveCustomers(updatedCustomers);

    // 2. Automatically create Business IN transaction
    const newTx: Transaction = {
      id: `tx-cust-${Date.now()}`,
      tenant_id: tenant.id,
      type: 'IN',
      account: 'BUSINESS',
      category: 'Iuran Bulanan Pelanggan',
      amount: customer.monthly_fee,
      notes: `Iuran Cash: ${customer.name} (${customer.area})`,
      customer_id: customer.id,
      created_at: new Date().toISOString(),
    };

    saveTransactions([newTx, ...transactions]);

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('customers').update({ is_paid: true }).eq('id', customer.id);
      supabase.from('transactions').insert([newTx]);
    }

    return newTx;
  }, [customers, tenant.id, transactions, saveCustomers, saveTransactions]);

  // Action: One-Click Mark Recurring Bill as Paid (LUNAS)
  const payRecurringBill = useCallback((bill: RecurringBill) => {
    if (bill.is_paid) return;

    // 1. Mark bill paid
    const updatedBills = bills.map(b => 
      b.id === bill.id 
        ? { ...b, is_paid: true, last_paid_at: new Date().toISOString() } 
        : b
    );
    saveBills(updatedBills);

    // 2. Automatically record OUT transaction
    const newTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      tenant_id: tenant.id,
      type: 'OUT',
      account: bill.account,
      category: bill.account === 'BUSINESS' ? 'Kewajiban Rutin Bisnis' : 'Kewajiban Rutin Pribadi',
      amount: bill.amount,
      notes: `Bayar Tagihan: ${bill.title}`,
      created_at: new Date().toISOString(),
    };

    saveTransactions([newTx, ...transactions]);

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('recurring_bills').update({ is_paid: true, last_paid_at: new Date().toISOString() }).eq('id', bill.id);
      supabase.from('transactions').insert([newTx]);
    }

    return newTx;
  }, [bills, saveBills, tenant.id, transactions, saveTransactions]);

  // Action: Add Customer
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'tenant_id' | 'is_paid'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      tenant_id: tenant.id,
      is_paid: false,
      updated_at: new Date().toISOString(),
    };
    const updated = [newCustomer, ...customers];
    saveCustomers(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('customers').insert([newCustomer]).then(({ error }) => {
        if (error) console.error('Supabase sync error for add customer:', error);
      });
    }
    return newCustomer;
  }, [customers, saveCustomers, tenant.id]);

  // Action: Update Customer
  const updateCustomer = useCallback((updatedCust: Customer) => {
    const updated = customers.map(c => c.id === updatedCust.id ? { ...updatedCust, updated_at: new Date().toISOString() } : c);
    saveCustomers(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('customers').update(updatedCust).eq('id', updatedCust.id).then(({ error }) => {
        if (error) console.error('Supabase sync error for update customer:', error);
      });
    }
  }, [customers, saveCustomers]);

  // Action: Delete Customer
  const deleteCustomer = useCallback((id: string) => {
    const updated = customers.filter(c => c.id !== id);
    saveCustomers(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('customers').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase sync error for delete customer:', error);
      });
    }
  }, [customers, saveCustomers]);

  // Action: Add Recurring Bill
  const addRecurringBill = useCallback((billData: Omit<RecurringBill, 'id' | 'tenant_id' | 'is_paid'>) => {
    const newBill: RecurringBill = {
      ...billData,
      id: `bill-${Date.now()}`,
      tenant_id: tenant.id,
      is_paid: false,
    };
    const updated = [...bills, newBill];
    saveBills(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('recurring_bills').insert([newBill]).then(({ error }) => {
        if (error) console.error('Supabase sync error for add bill:', error);
      });
    }
    return newBill;
  }, [bills, saveBills, tenant.id]);

  // Action: Update Recurring Bill
  const updateRecurringBill = useCallback((updatedBill: RecurringBill) => {
    const updated = bills.map(b => b.id === updatedBill.id ? updatedBill : b);
    saveBills(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('recurring_bills').update(updatedBill).eq('id', updatedBill.id).then(({ error }) => {
        if (error) console.error('Supabase sync error for update bill:', error);
      });
    }
  }, [bills, saveBills]);

  // Action: Delete Recurring Bill
  const deleteRecurringBill = useCallback((id: string) => {
    const updated = bills.filter(b => b.id !== id);
    saveBills(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('recurring_bills').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase sync error for delete bill:', error);
      });
    }
  }, [bills, saveBills]);

  // Reset all bills status (e.g. at new month)
  const resetBillsForNewMonth = useCallback(() => {
    const updated = bills.map(b => ({ ...b, is_paid: false }));
    saveBills(updated);
  }, [bills, saveBills]);

  // Reset demo data to initial mock
  const resetToFactoryDefault = useCallback(() => {
    const cust = generateMockCustomers();
    setTenant(DEFAULT_TENANT);
    setTransactions(INITIAL_TRANSACTIONS);
    setCustomers(cust);
    setBills(INITIAL_RECURRING_BILLS);
    setSalaryBudget(5000000);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(DEFAULT_TENANT));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(cust));
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_RECURRING_BILLS));
      localStorage.setItem(STORAGE_KEYS.SALARY_BUDGET, '5000000');
    }
  }, []);

  // Derived state for Month Simulation
  const derivedCustomers = useMemo(() => {
    if (selectedMonth === 'September 2026') return customers;
    // Simulate difference for past months
    const offset = selectedMonth.length;
    return customers.map((c, i) => {
      if (i % 3 === 0) return { ...c, is_paid: false };
      return c;
    });
  }, [customers, selectedMonth]);

  // Compute Business Summary
  const businessSummary: BusinessSummary = useMemo(() => {
    const bizTransactions = transactions.filter(t => t.account === 'BUSINESS');
    let totalIn = bizTransactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    let totalOut = bizTransactions
      .filter(t => t.type === 'OUT')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const paidCustCount = derivedCustomers.filter(c => c.is_paid).length;
    const unpaidCustCount = derivedCustomers.length - paidCustCount;

    if (selectedMonth !== 'September 2026') {
      const offset = selectedMonth.length;
      totalIn = Math.max(0, totalIn - (offset * 800000));
      totalOut = Math.max(0, totalOut - (offset * 150000));
    }

    return {
      totalIn,
      totalOut,
      netProfit: totalIn - totalOut,
      totalCustomers: derivedCustomers.length,
      paidCustomers: paidCustCount,
      unpaidCustomers: unpaidCustCount,
    };
  }, [transactions, derivedCustomers, selectedMonth]);

  // Compute Personal Summary & Leak Detection
  const personalSummary: PersonalSummary = useMemo(() => {
    const persTransactions = transactions.filter(t => t.account === 'PERSONAL' && t.type === 'OUT');
    const totalOut = persTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const safeBalance = salaryBudget - totalOut;

    // Group expenses by category
    const catMap: Record<string, number> = {};
    persTransactions.forEach(t => {
      const cat = t.category || 'Lain-lain';
      catMap[cat] = (catMap[cat] || 0) + Number(t.amount || 0);
    });

    const topLeaks = Object.entries(catMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalOut > 0 ? Math.round((amount / totalOut) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    return {
      salaryBudget,
      totalOut,
      safeBalance,
      topLeaks,
    };
  }, [transactions, salaryBudget]);

  // Action: Add New Tenant (Super Admin)
  const addTenant = useCallback((newTenantData: Omit<Tenant, 'id' | 'created_at'>) => {
    const newTenant: Tenant = {
      ...newTenantData,
      id: `tenant-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: newTenantData.status || 'ACTIVE',
      plan: newTenantData.plan || 'Pro Single-RW',
      monthly_price: newTenantData.monthly_price ?? 150000,
    };
    const updated = [newTenant, ...tenants];
    setTenants(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TENANTS_LIST, JSON.stringify(updated));
    }
    
    if (isSupabaseConfigured && supabase) {
      supabase.from('tenants').insert([newTenant]).then(({ error }) => {
        if (error) console.error('Supabase sync error for add tenant:', error);
      });
    }

    return newTenant;
  }, [tenants]);

  // Action: Update Tenant (Super Admin)
  const updateTenant = useCallback((updatedTenant: Tenant) => {
    const updated = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
    setTenants(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TENANTS_LIST, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('tenants').update(updatedTenant).eq('id', updatedTenant.id).then(({ error }) => {
        if (error) console.error('Supabase sync error for update tenant:', error);
      });
    }
  }, [tenants]);

  // Action: Delete Tenant (Super Admin)
  const deleteTenant = useCallback((id: string) => {
    const updated = tenants.filter(t => t.id !== id);
    setTenants(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TENANTS_LIST, JSON.stringify(updated));
    }
  }, [tenants]);

  // Action: Switch Active Tenant (Super Admin)
  const switchTenant = useCallback((tenantId: string) => {
    const target = tenants.find(t => t.id === tenantId);
    if (target) {
      saveTenant(target);
    }
  }, [tenants, saveTenant]);

  // Auth Action: Login as Tenant Owner
  const loginAsTenant = useCallback((targetTenantId: string) => {
    const target = tenants.find(t => t.id === targetTenantId);
    if (target) {
      saveTenant(target);
      const newSession: UserSession = {
        role: 'TENANT_OWNER',
        tenantId: target.id,
        username: target.owner_name,
      };
      setSession(newSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
      }
      return true;
    }
    return false;
  }, [tenants, saveTenant]);

  // Auth Action: Login as Super Admin
  const loginAsSuperAdmin = useCallback((password: string) => {
    if (password === 'admin' || password === '1234') {
      const newSession: UserSession = {
        role: 'SUPER_ADMIN',
        username: 'Super Admin SaaS',
      };
      setSession(newSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
      }
      return true;
    }
    return false;
  }, []);

  // Auth Action: Logout
  const logout = useCallback(() => {
    const newSession: UserSession = { role: null };
    setSession(newSession);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }, []);

  return {
    isLoaded,
    session,
    currentUserRole: session.role,
    tenant,
    tenants,
    setTenant: saveTenant,
    addTenant,
    updateTenant,
    deleteTenant,
    switchTenant,
    loginAsTenant,
    loginAsSuperAdmin,
    logout,
    selectedMonth,
    setSelectedMonth,
    transactions,
    customers: derivedCustomers,
    bills,
    salaryBudget,
    setSalaryBudget: saveSalaryBudget,
    businessSummary,
    personalSummary,
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
    resetBillsForNewMonth,
    resetToFactoryDefault,
  };
}
