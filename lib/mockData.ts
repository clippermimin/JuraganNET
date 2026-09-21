import { Customer, RecurringBill, Tenant, Transaction, MonthlyCashflow } from './types';

export const DEFAULT_TENANT: Tenant = {
  id: '00000000-0000-0000-0000-000000000001',
  business_name: 'Arjuna Net',
  owner_name: 'Pak Arjuna',
  phone: '081298765432',
  status: 'ACTIVE',
  plan: 'Pro Multi-RW',
  monthly_price: 150000,
  created_at: new Date().toISOString(),
};

export const INITIAL_TENANTS: Tenant[] = [
  DEFAULT_TENANT,
  {
    id: '00000000-0000-0000-0000-000000000002',
    business_name: 'Berkah Net Mandiri',
    owner_name: 'Kang Solihin',
    phone: '081311223344',
    status: 'ACTIVE',
    plan: 'Basic Single-RW',
    monthly_price: 99000,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    business_name: 'Garuda Fiber Cipinang',
    owner_name: 'Pak RT Dedi',
    phone: '081599887766',
    status: 'TRIAL',
    plan: 'Trial 14 Hari',
    monthly_price: 0,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_RECURRING_BILLS: RecurringBill[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const MOCK_HISTORICAL_CASHFLOW: MonthlyCashflow[] = [];

export function generateMockCustomers(): Customer[] {
  return [];
}
