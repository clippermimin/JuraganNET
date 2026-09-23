import { Customer, Tenant } from './types';

export function formatIDR(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortIDR(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)} Jt`;
  }
  if (Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(0)} Rb`;
  }
  return String(amount);
}

export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Generate friendly WhatsApp message link for receipt
export function getWhatsAppReceiptUrl(customer: Customer, tenant: Tenant, customAmount?: number): string {
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
  let phoneWithCode = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    phoneWithCode = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    phoneWithCode = '62' + cleanPhone;
  }

  const amount = customAmount || customer.monthly_fee;
  const today = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const message = `✅ *BUKTI PEMBAYARAN IURAN WIFI*\n*${tenant.business_name.toUpperCase()}*\n━━━━━━━━━━━━━━━━━\n\n` +
    `Halo Bpk/Ibu *${customer.name}*,\n` +
    `Alhamdulillah pembayaran iuran internet Anda telah kami terima:\n\n` +
    `👤 *Nama:* ${customer.name}\n` +
    `📍 *Wilayah/Server:* ${customer.area}\n` +
    `💰 *Nominal:* ${formatIDR(amount)}\n` +
    `📅 *Tanggal:* ${today}\n` +
    `📌 *Status:* LUNAS (Sah)\n\n` +
    `Terima kasih atas dukungannya untuk kelancaran jaringan internet pelanggan bersama *${tenant.business_name}*.\n\n` +
    `Salam hangat,\n*${tenant.owner_name}*`;

  return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
}

// Generate friendly WhatsApp reminder for unpaid customer
export function getWhatsAppReminderUrl(customer: Customer, tenant: Tenant): string {
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
  let phoneWithCode = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    phoneWithCode = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    phoneWithCode = '62' + cleanPhone;
  }

  const message = `📡 *PENGINGAT IURAN INTERNET BULAN INI*\n*${tenant.business_name.toUpperCase()}*\n━━━━━━━━━━━━━━━━━\n\n` +
    `Halo Bpk/Ibu *${customer.name}* (${customer.area}),\n` +
    `Semoga selalu dalam keadaan sehat walafiat.\n\n` +
    `Mengingatkan iuran WiFi bulan ini sebesar *${formatIDR(customer.monthly_fee)}* belum tercatat.\n\n` +
    `Bapak/Ibu bisa titip cash saat petugas keliling atau hubungi *${tenant.owner_name}* (${tenant.phone || ''}).\n\n` +
    `Terima kasih banyak atas kerjasamanya! 🙏`;

  return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
}

// Smart voice parser for speech-to-text
export function parseVoiceInput(speechText: string): { amount?: number; notes?: string; category?: string } {
  const text = speechText.toLowerCase().trim();
  let detectedAmount: number | undefined;
  let detectedCategory: string | undefined;

  // Words to numbers dictionary
  if (text.includes('juta') || text.includes('jt')) {
    const match = text.match(/(\d+([\.,]\d+)?)\s*(juta|jt)/);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      detectedAmount = Math.round(num * 1000000);
    } else if (text.includes('satu juta') || text.includes('sejuta')) {
      detectedAmount = 1000000;
    } else if (text.includes('dua juta')) {
      detectedAmount = 2000000;
    } else if (text.includes('tiga juta')) {
      detectedAmount = 3000000;
    }
  }

  if (!detectedAmount && (text.includes('ribu') || text.includes('rb'))) {
    const match = text.match(/(\d+)\s*(ribu|rb)/);
    if (match) {
      detectedAmount = parseInt(match[1], 10) * 1000;
    } else if (text.includes('seratus ribu') || text.includes('cepek')) {
      detectedAmount = 100000;
    } else if (text.includes('dua ratus ribu')) {
      detectedAmount = 200000;
    } else if (text.includes('lima puluh ribu') || text.includes('gocap')) {
      detectedAmount = 50000;
    } else if (text.includes('seratus lima puluh ribu')) {
      detectedAmount = 150000;
    }
  }

  // Pure digits if any
  if (!detectedAmount) {
    const digitMatch = text.match(/\b\d{4,9}\b/);
    if (digitMatch) {
      detectedAmount = parseInt(digitMatch[0], 10);
    }
  }

  // Category detection
  if (text.includes('iuran') || text.includes('bulanan') || text.includes('bayar wifi') || text.includes('tagihan')) {
    detectedCategory = 'Iuran Bulanan Warga';
  } else if (text.includes('pasang baru') || text.includes('instalasi') || text.includes('psb')) {
    detectedCategory = 'Pasang Baru (PSB)';
  } else if (text.includes('voucher') || text.includes('koin') || text.includes('gesek')) {
    detectedCategory = 'Setoran Voucher WiFi';
  } else if (text.includes('indomart') || text.includes('indomaret') || text.includes('alfamart') || text.includes('alfa') || text.includes('warung') || text.includes('cemilan')) {
    detectedCategory = 'Indomaret / Warung';
  } else if (text.includes('rokok') || text.includes('ngopi') || text.includes('kopi') || text.includes('sampoerna') || text.includes('surya')) {
    detectedCategory = 'Rokok & Kopi';
  } else if (text.includes('makan') || text.includes('sarapan') || text.includes('siang') || text.includes('malam') || text.includes('padang') || text.includes('warteg')) {
    detectedCategory = 'Makan & Minum';
  } else if (text.includes('dapur') || text.includes('beras') || text.includes('lauk') || text.includes('pasar') || text.includes('minyak') || text.includes('gas')) {
    detectedCategory = 'Beras & Dapur';
  } else if (text.includes('anak') || text.includes('istri') || text.includes('sekolah') || text.includes('susu') || text.includes('pampers')) {
    detectedCategory = 'Uang Jajan Anak';
  } else if (text.includes('game') || text.includes('topup') || text.includes('pulsa') || text.includes('kuota') || text.includes('ml') || text.includes('ff')) {
    detectedCategory = 'Pulsa & Game';
  } else if (text.includes('router') || text.includes('modem') || text.includes('ont') || text.includes('zte') || text.includes('huawei')) {
    detectedCategory = 'Router & ONT Pelanggan';
  } else if (text.includes('kabel') || text.includes('dropcore') || text.includes('patchcord') || text.includes('fo') || text.includes('fiber')) {
    detectedCategory = 'Kabel FO & Dropcore';
  } else if (text.includes('isp') || text.includes('indihome') || text.includes('biznet') || text.includes('iconnet') || text.includes('bandwidth')) {
    detectedCategory = 'Bayar ISP / Bandwidth';
  } else if (text.includes('gaji') || text.includes('upah') || text.includes('teknisi')) {
    detectedCategory = 'Gaji Tim Lapangan';
  } else if (text.includes('listrik') || text.includes('token') || text.includes('pln')) {
    detectedCategory = 'Listrik Server & OLT';
  } else if (text.includes('bensin') || text.includes('motor') || text.includes('oli') || text.includes('tambal')) {
    detectedCategory = 'Bensin Lapangan';
  } else if (text.includes('tiang') || text.includes('kas rw') || text.includes('iuran rw') || text.includes('rt') || text.includes('rw')) {
    detectedCategory = 'Sewa Tiang & Kas RT/RW';
  } else if (text.includes('cicilan') || text.includes('arisan') || text.includes('koperasi') || text.includes('pinjol')) {
    detectedCategory = 'Cicilan & Arisan';
  }

  return {
    amount: detectedAmount,
    category: detectedCategory,
    notes: speechText,
  };
}
