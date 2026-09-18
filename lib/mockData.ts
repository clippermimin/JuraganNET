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
  {
    id: 'bill-1',
    tenant_id: DEFAULT_TENANT.id,
    title: 'ISP Urban (Bandwidth Utama 500M)',
    amount: 4500000,
    account: 'BUSINESS',
    due_day: 5,
    is_paid: false,
  },
  {
    id: 'bill-2',
    tenant_id: DEFAULT_TENANT.id,
    title: 'Gaji Mas Dwi (Teknisi Lapangan)',
    amount: 2500000,
    account: 'BUSINESS',
    due_day: 1,
    is_paid: false,
  },
  {
    id: 'bill-3',
    tenant_id: DEFAULT_TENANT.id,
    title: 'Kas RW 04 Cipinang',
    amount: 250000,
    account: 'BUSINESS',
    due_day: 10,
    is_paid: false,
  },
  {
    id: 'bill-4',
    tenant_id: DEFAULT_TENANT.id,
    title: 'Listrik Server OLT & Rak',
    amount: 650000,
    account: 'BUSINESS',
    due_day: 15,
    is_paid: true,
    last_paid_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'bill-5',
    tenant_id: DEFAULT_TENANT.id,
    title: 'Sewa Tiang & Pos Kontrakan Hub',
    amount: 500000,
    account: 'BUSINESS',
    due_day: 20,
    is_paid: false,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    tenant_id: DEFAULT_TENANT.id,
    type: 'IN',
    account: 'BUSINESS',
    category: 'Iuran Bulanan Pelanggan',
    amount: 14500000,
    notes: 'Kumpulan iuran cash 145 pelanggan awal bulan',
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: 'tx-2',
    tenant_id: DEFAULT_TENANT.id,
    type: 'IN',
    account: 'BUSINESS',
    category: 'Pasang Baru / Registrasi',
    amount: 700000,
    notes: 'Pasang baru 2 rumah di RW 02 Cileweun',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'tx-3',
    tenant_id: DEFAULT_TENANT.id,
    type: 'OUT',
    account: 'BUSINESS',
    category: 'Beli Alat/Kabel',
    amount: 420000,
    notes: 'Beli dropcore 1 roll 1000m + fast connector di Glodok',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'tx-4',
    tenant_id: DEFAULT_TENANT.id,
    type: 'OUT',
    account: 'BUSINESS',
    category: 'Listrik & Operasional',
    amount: 650000,
    notes: 'Token listrik PLN OLT utama',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'tx-5',
    tenant_id: DEFAULT_TENANT.id,
    type: 'OUT',
    account: 'PERSONAL',
    category: 'Keluarga / Nene',
    amount: 1500000,
    notes: 'Kirim belanja bulanan nene & keluarga di kampung',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'tx-6',
    tenant_id: DEFAULT_TENANT.id,
    type: 'OUT',
    account: 'PERSONAL',
    category: 'Beli Domba / Ternak',
    amount: 1200000,
    notes: 'Cicilan 1 ekor domba garut titip di kandang Pak Haji',
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: 'tx-7',
    tenant_id: DEFAULT_TENANT.id,
    type: 'OUT',
    account: 'PERSONAL',
    category: 'Belanja Dapur',
    amount: 850000,
    notes: 'Beras, minyak, lauk pauk mingguan',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'tx-8',
    tenant_id: DEFAULT_TENANT.id,
    type: 'OUT',
    account: 'PERSONAL',
    category: 'Gadget / Top Up',
    amount: 350000,
    notes: 'Pulsa kuota darurat & top up game anak',
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: 'tx-9',
    tenant_id: DEFAULT_TENANT.id,
    type: 'OUT',
    account: 'PERSONAL',
    category: 'Bensin & Operasional',
    amount: 150000,
    notes: 'Bensin motor vario 3 hari keliling',
    created_at: new Date().toISOString(),
  },
];

export const MOCK_HISTORICAL_CASHFLOW: MonthlyCashflow[] = [
  { month: 'Mei 26', in: 13200000, out: 4800000 },
  { month: 'Jun 26', in: 14000000, out: 5000000 },
  { month: 'Jul 26', in: 14500000, out: 5300000 },
  { month: 'Agu 26', in: 14800000, out: 5400000 },
  { month: 'Sep 26', in: 15400000, out: 5570000 },
];

// Helper to generate 900 realistic customers
export function generateMockCustomers(): Customer[] {
  const firstNames = [
    'Haji Maman', 'Asep', 'Ujang', 'Budi', 'Dedi', 'Endang', 'Iwan', 'Jajang', 
    'Agus', 'Cecep', 'Siti', 'Yayah', 'Rina', 'Wati', 'Dewi', 'Solihin', 'Sukirno',
    'Yayan', 'Dadan', 'Nanang', 'Tatang', 'Oman', 'Komar', 'Gugun', 'Encep',
    'Hendra', 'Deni', 'Rahmat', 'Mulyadi', 'Bambang', 'Wawan', 'Ade', 'Kusnadi'
  ];
  const lastNames = [
    'Saepudin', 'Santoso', 'Hidayat', 'Kurniawan', 'Supriatna', 'Wijaya', 'Hermawan',
    'Setiawan', 'Pratama', 'Nugraha', 'Kusuma', 'Gunawan', 'Sutrisno', 'Permana',
    'Sulaeman', 'Syahputra', 'Maulana', 'Firmansyah', 'Sudrajat', 'Suryana', 'Saputra'
  ];
  const areas = [
    { name: 'RW 04 Cipinang', weight: 0.42 },
    { name: 'RW 02 Cileweun', weight: 0.36 },
    { name: 'RW 01 Sindang', weight: 0.22 },
  ];

  const packages = [
    { fee: 100000, label: 'Paket Hemat 10 Mbps' },
    { fee: 150000, label: 'Paket Standar 20 Mbps' },
    { fee: 200000, label: 'Paket Joss 30 Mbps' },
  ];

  const customers: Customer[] = [];

  for (let i = 1; i <= 900; i++) {
    const fName = firstNames[(i * 7) % firstNames.length];
    const lName = lastNames[(i * 11) % lastNames.length];
    const name = `${fName} ${lName} ${i > 300 ? `#${i}` : ''}`.trim();
    
    // Choose area based on index
    let area = areas[0].name;
    if (i > 900 * 0.42 && i <= 900 * 0.78) {
      area = areas[1].name;
    } else if (i > 900 * 0.78) {
      area = areas[2].name;
    }

    // Realistic package distribution
    const pkg = i % 5 === 0 ? packages[2] : (i % 3 === 0 ? packages[1] : packages[0]);

    // Around 65% already paid this month
    const is_paid = (i * 13) % 100 < 65;

    // Indonesian phone number
    const phoneSuffix = String(10000000 + (i * 9876) % 89999999);
    const phone = `0812${phoneSuffix.slice(0, 8)}`;

    customers.push({
      id: `cust-${i}`,
      tenant_id: DEFAULT_TENANT.id,
      name,
      area,
      monthly_fee: pkg.fee,
      phone,
      is_paid,
      notes: is_paid ? 'Lunas awal bulan' : 'Belum ditagih / janji tanggal 10',
      updated_at: new Date(Date.now() - (i % 30) * 86400000).toISOString(),
    });
  }

  return customers;
}
