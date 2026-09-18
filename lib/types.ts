export type TransactionType = 'IN' | 'OUT';
export type AccountType = 'BUSINESS' | 'PERSONAL';
export type UserRole = 'SUPER_ADMIN' | 'TENANT_OWNER' | null;

export interface UserSession {
  role: UserRole;
  tenantId?: string;
  username?: string;
}

export interface Tenant {
  id: string;
  business_name: string;
  owner_name: string;
  phone?: string;
  created_at?: string;
  status?: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  plan?: string;
  monthly_price?: number;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  area: string; // e.g. 'RW 04 Cipinang', 'RW 02 Cileweun', 'RW 01 Sindang'
  monthly_fee: number;
  phone: string;
  is_paid: boolean;
  notes?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  type: TransactionType;
  account: AccountType;
  category: string;
  amount: number;
  notes?: string;
  customer_id?: string;
  created_at: string;
}

export interface RecurringBill {
  id: string;
  tenant_id: string;
  title: string;
  amount: number;
  account: AccountType;
  due_day: number;
  is_paid: boolean;
  last_paid_at?: string;
}

export interface BusinessSummary {
  totalIn: number;
  totalOut: number;
  netProfit: number;
  totalCustomers: number;
  paidCustomers: number;
  unpaidCustomers: number;
}

export interface PersonalSummary {
  salaryBudget: number; // Jatah Gaji dari Bisnis
  totalOut: number;
  safeBalance: number; // Sisa Uang Jajan / Aman
  topLeaks: { category: string; amount: number; percentage: number }[];
}

export interface MonthlyCashflow {
  month: string;
  in: number;
  out: number;
}

