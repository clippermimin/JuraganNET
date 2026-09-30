import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Menggunakan Tenant ID utama Soni di Juragan Net
const TARGET_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function seedSoni() {
  console.log('🚀 Memulai upload data pelanggan ke Supabase Juragan Net...');

  // 1. Pastikan profil Tenant Soni update
  const { data: tenantData, error: tenantErr } = await supabase
    .from('tenants')
    .upsert({
      id: TARGET_TENANT_ID,
      business_name: 'Soni Net (RT RW Net)',
      owner_name: 'Soni',
      phone: '081298765432',
      status: 'ACTIVE',
      plan: 'Pro Multi-RW',
      monthly_price: 150000,
    }, { onConflict: 'id' })
    .select();

  if (tenantErr) {
    console.error('Info tenant:', tenantErr.message);
  } else {
    console.log('✅ Tenant aktif terkonfirmasi:', tenantData);
  }

  // 2. Baca file soni_net_customers.json
  const jsonPath = path.join(process.cwd(), 'public', 'soni_net_customers.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const customers = JSON.parse(rawData);

  console.log(`📦 Memproses ${customers.length} data pelanggan valid...`);

  // Transform ke format tabel Supabase customers
  const formattedCustomers = customers.map((c: any) => {
    // Generate deterministic UUID
    const uuidHash = crypto.createHash('md5').update(`soninet_${c.id}_${c.name}`).digest('hex');
    const formattedUuid = `${uuidHash.substring(0, 8)}-${uuidHash.substring(8, 12)}-4${uuidHash.substring(13, 16)}-a${uuidHash.substring(17, 20)}-${uuidHash.substring(20, 32)}`;

    const notesArr: string[] = [];
    if (c.address_detail && c.address_detail !== c.area) notesArr.push(`Alamat: ${c.address_detail}`);
    if (c.tech_note) notesArr.push(`Akun: ${c.tech_note}`);
    if (c.due_day) notesArr.push(`Jatuh Tempo: Tgl ${c.due_day}`);
    if (c.is_off) notesArr.push(`Status: NON-AKTIF`);
    if (c.status_raw) notesArr.push(`Catatan: ${c.status_raw}`);

    return {
      id: formattedUuid,
      tenant_id: TARGET_TENANT_ID,
      name: c.name,
      area: c.area,
      monthly_fee: c.monthly_fee,
      phone: c.phone || '',
      is_paid: Boolean(c.is_paid),
      notes: notesArr.join('; ')
    };
  });

  // Batch insert per 50 baris
  const chunkSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < formattedCustomers.length; i += chunkSize) {
    const chunk = formattedCustomers.slice(i, i + chunkSize);
    const { error } = await supabase.from('customers').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`❌ Gagal upload batch ${Math.floor(i / chunkSize) + 1}:`, error.message);
    } else {
      totalInserted += chunk.length;
      console.log(`✅ Berhasil upload batch ${Math.floor(i / chunkSize) + 1} (${totalInserted}/${formattedCustomers.length} pelanggan)`);
    }
  }

  console.log(`\n🎉 SELESAI! Total ${totalInserted} data pelanggan berhasil diupload ke database Supabase Juragan Net!`);
}

seedSoni().catch(console.error);
