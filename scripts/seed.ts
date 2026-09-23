import { createClient } from '@supabase/supabase-js';
import { INITIAL_TENANTS, INITIAL_TRANSACTIONS, INITIAL_RECURRING_BILLS } from '../lib/mockData';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const mockCustomers = [
  { id: crypto.randomUUID(), tenant_id: DEFAULT_TENANT_ID, name: 'Bapak Budi (Posyandu)', area: 'RW 01', monthly_fee: 150000, phone: '0811223344', is_paid: true },
  { id: crypto.randomUUID(), tenant_id: DEFAULT_TENANT_ID, name: 'Ibu Siti (Warung)', area: 'RW 02', monthly_fee: 150000, phone: '0855667788', is_paid: false },
  { id: crypto.randomUUID(), tenant_id: DEFAULT_TENANT_ID, name: 'Mas Joko (Kost)', area: 'RW 01', monthly_fee: 200000, phone: '0899887766', is_paid: true },
  { id: crypto.randomUUID(), tenant_id: DEFAULT_TENANT_ID, name: 'Keluarga Andi', area: 'RW 03', monthly_fee: 150000, phone: '0812345678', is_paid: false }
];

async function seed() {
  console.log('Seeding data to Supabase...');

  // 1. Recurring Bills
  const { error: billsError } = await supabase.from('recurring_bills').upsert(INITIAL_RECURRING_BILLS, { onConflict: 'id' });
  if (billsError) console.error('Error seeding bills:', billsError);
  else console.log(`Seeded ${INITIAL_RECURRING_BILLS.length} recurring bills`);

  // 2. Transactions
  const { error: txError } = await supabase.from('transactions').upsert(INITIAL_TRANSACTIONS, { onConflict: 'id' });
  if (txError) console.error('Error seeding transactions:', txError);
  else console.log(`Seeded ${INITIAL_TRANSACTIONS.length} transactions`);

  // 3. Customers
  const { error: customersError } = await supabase.from('customers').upsert(mockCustomers, { onConflict: 'id' });
  if (customersError) console.error('Error seeding customers:', customersError);
  else console.log(`Seeded ${mockCustomers.length} customers`);

  console.log('Done!');
}

seed();

