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

export const INITIAL_RECURRING_BILLS: RecurringBill[] = [
  { id: 'bill-01', tenant_id: DEFAULT_TENANT.id, title: 'Samsuri', amount: 15000000, account: 'BUSINESS', due_day: 5, is_paid: true, last_paid_at: '2026-09-10T10:00:00.000Z' },
  { id: 'bill-02', tenant_id: DEFAULT_TENANT.id, title: 'Udin Sedunia', amount: 5000000, account: 'BUSINESS', due_day: 10, is_paid: false },
  { id: 'bill-03', tenant_id: DEFAULT_TENANT.id, title: 'Kabel Optik (Oftik)', amount: 3000000, account: 'BUSINESS', due_day: 15, is_paid: false },
  { id: 'bill-04', tenant_id: DEFAULT_TENANT.id, title: 'Alat-Alat Listrik', amount: 1000000, account: 'BUSINESS', due_day: 15, is_paid: false },
  { id: 'bill-05', tenant_id: DEFAULT_TENANT.id, title: 'Rukun', amount: 2000000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-11T10:00:00.000Z' },
  { id: 'bill-06', tenant_id: DEFAULT_TENANT.id, title: 'Amuna', amount: 6000000, account: 'BUSINESS', due_day: 10, is_paid: false },
  { id: 'bill-07', tenant_id: DEFAULT_TENANT.id, title: 'Kontrakan / Motor', amount: 1500000, account: 'BUSINESS', due_day: 20, is_paid: true, last_paid_at: '2026-09-12T10:00:00.000Z' },
  { id: 'bill-08', tenant_id: DEFAULT_TENANT.id, title: 'Zakat', amount: 1000000, account: 'BUSINESS', due_day: 25, is_paid: false },
  { id: 'bill-09', tenant_id: DEFAULT_TENANT.id, title: 'ISP Bandwidth Utama', amount: 14000000, account: 'BUSINESS', due_day: 5, is_paid: false },
  { id: 'bill-10', tenant_id: DEFAULT_TENANT.id, title: 'Gaji Pegawai', amount: 13000000, account: 'BUSINESS', due_day: 1, is_paid: false },
  { id: 'bill-11', tenant_id: DEFAULT_TENANT.id, title: 'Polisi / Koordinasi', amount: 1750000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-13T10:00:00.000Z' },
  { id: 'bill-12', tenant_id: DEFAULT_TENANT.id, title: 'Rohendi', amount: 500000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-14T10:00:00.000Z' },
  { id: 'bill-13', tenant_id: DEFAULT_TENANT.id, title: 'Biaya Lainnya', amount: 2000000, account: 'BUSINESS', due_day: 25, is_paid: true, last_paid_at: '2026-09-15T10:00:00.000Z' },
  { id: 'bill-14', tenant_id: DEFAULT_TENANT.id, title: 'Bu Maria', amount: 500000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-16T10:00:00.000Z' },
  { id: 'bill-15', tenant_id: DEFAULT_TENANT.id, title: 'Cibuyung', amount: 1250000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-17T10:00:00.000Z' },
  { id: 'bill-16', tenant_id: DEFAULT_TENANT.id, title: 'Cicilan Motor Genio', amount: 1235000, account: 'BUSINESS', due_day: 15, is_paid: true, last_paid_at: '2026-09-18T10:00:00.000Z' },
  { id: 'bill-17', tenant_id: DEFAULT_TENANT.id, title: 'Listrik', amount: 1000000, account: 'BUSINESS', due_day: 20, is_paid: true, last_paid_at: '2026-09-19T10:00:00.000Z' },
  { id: 'bill-18', tenant_id: DEFAULT_TENANT.id, title: 'Rumah Tangga (Rh Tangga)', amount: 12000000, account: 'BUSINESS', due_day: 1, is_paid: false },
  { id: 'bill-19', tenant_id: DEFAULT_TENANT.id, title: 'Koperasi', amount: 1030000, account: 'BUSINESS', due_day: 15, is_paid: true, last_paid_at: '2026-09-20T10:00:00.000Z' },
  { id: 'bill-20', tenant_id: DEFAULT_TENANT.id, title: 'Kas RW Cipinang', amount: 850000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-21T10:00:00.000Z' },
  { id: 'bill-21', tenant_id: DEFAULT_TENANT.id, title: 'Kas RW Cileweun', amount: 300000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-21T11:00:00.000Z' },
  { id: 'bill-22', tenant_id: DEFAULT_TENANT.id, title: 'Kas RW Ciodeng', amount: 150000, account: 'BUSINESS', due_day: 10, is_paid: true, last_paid_at: '2026-09-22T10:00:00.000Z' },
  { id: 'bill-23', tenant_id: DEFAULT_TENANT.id, title: 'Kas RW Ciawi Gede', amount: 300000, account: 'BUSINESS', due_day: 10, is_paid: false },
  { id: 'bill-24', tenant_id: DEFAULT_TENANT.id, title: 'Kontrakan Aaguk', amount: 350000, account: 'BUSINESS', due_day: 20, is_paid: true, last_paid_at: '2026-09-22T12:00:00.000Z' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-01', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 15000000, notes: 'Bayar Tagihan: Samsuri', created_at: '2026-09-10T10:00:00.000Z' },
  { id: 'tx-05', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 2000000, notes: 'Bayar Tagihan: Rukun', created_at: '2026-09-11T10:00:00.000Z' },
  { id: 'tx-07', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 1500000, notes: 'Bayar Tagihan: Kontrakan / Motor', created_at: '2026-09-12T10:00:00.000Z' },
  { id: 'tx-11', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 1750000, notes: 'Bayar Tagihan: Polisi / Koordinasi', created_at: '2026-09-13T10:00:00.000Z' },
  { id: 'tx-12', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 500000, notes: 'Bayar Tagihan: Rohendi', created_at: '2026-09-14T10:00:00.000Z' },
  { id: 'tx-13', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 2000000, notes: 'Bayar Tagihan: Biaya Lainnya', created_at: '2026-09-15T10:00:00.000Z' },
  { id: 'tx-14', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 500000, notes: 'Bayar Tagihan: Bu Maria', created_at: '2026-09-16T10:00:00.000Z' },
  { id: 'tx-15', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 1250000, notes: 'Bayar Tagihan: Cibuyung', created_at: '2026-09-17T10:00:00.000Z' },
  { id: 'tx-16', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 1235000, notes: 'Bayar Tagihan: Cicilan Motor Genio', created_at: '2026-09-18T10:00:00.000Z' },
  { id: 'tx-17', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 1000000, notes: 'Bayar Tagihan: Listrik', created_at: '2026-09-19T10:00:00.000Z' },
  { id: 'tx-19', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 1030000, notes: 'Bayar Tagihan: Koperasi', created_at: '2026-09-20T10:00:00.000Z' },
  { id: 'tx-20', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 850000, notes: 'Bayar Tagihan: Kas RW Cipinang', created_at: '2026-09-21T10:00:00.000Z' },
  { id: 'tx-21', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 300000, notes: 'Bayar Tagihan: Kas RW Cileweun', created_at: '2026-09-21T11:00:00.000Z' },
  { id: 'tx-22', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 150000, notes: 'Bayar Tagihan: Kas RW Ciodeng', created_at: '2026-09-22T10:00:00.000Z' },
  { id: 'tx-24', tenant_id: DEFAULT_TENANT.id, type: 'OUT', account: 'BUSINESS', category: 'Kewajiban Rutin Bisnis', amount: 350000, notes: 'Bayar Tagihan: Kontrakan Aaguk', created_at: '2026-09-22T12:00:00.000Z' },
];

export const MOCK_HISTORICAL_CASHFLOW: MonthlyCashflow[] = [];

export function generateMockCustomers(): Customer[] {
  return [];
}

