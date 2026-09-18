import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessSummary, Customer, PersonalSummary, RecurringBill, Tenant, Transaction } from './types';
import { formatIDR, formatDateIndo } from './utils';

interface ExportData {
  tenant: Tenant;
  month: string;
  businessSummary: BusinessSummary;
  personalSummary: PersonalSummary;
  transactions: Transaction[];
  customers: Customer[];
  bills: RecurringBill[];
}

// 1. Export to Excel (.xlsx)
export function exportToExcel(data: ExportData) {
  const { tenant, month, businessSummary, personalSummary, transactions, customers, bills } = data;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan Keuangan
  const summaryRows = [
    ['LAPORAN KEUANGAN BULANAN - JURAGAN NET'],
    ['Nama Usaha:', tenant.business_name],
    ['Pemilik:', tenant.owner_name],
    ['Periode:', month],
    ['Tanggal Unduh:', new Date().toLocaleString('id-ID')],
    [''],
    ['=== ARUS KAS BISNIS RT/RW ==='],
    ['Total Uang Masuk Bisnis:', businessSummary.totalIn],
    ['Total Uang Keluar Bisnis:', businessSummary.totalOut],
    ['SISA UNTUNG BERSIH BISNIS:', businessSummary.netProfit],
    ['Total Pelanggan:', businessSummary.totalCustomers],
    ['Pelanggan Sudah Lunas:', businessSummary.paidCustomers],
    ['Pelanggan Belum Bayar:', businessSummary.unpaidCustomers],
    [''],
    ['=== DOMPET PRIBADI & KELUARGA ==='],
    ['Jatah Gaji dari Bisnis:', personalSummary.salaryBudget],
    ['Total Pengeluaran Pribadi Terpakai:', personalSummary.totalOut],
    ['Sisa Uang Jajan / Kebutuhan Aman:', personalSummary.safeBalance],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_Keuangan');

  // Sheet 2: Mutasi Transaksi
  const txRows = transactions.map((t, idx) => ({
    No: idx + 1,
    Tanggal: formatDateIndo(t.created_at),
    Jenis: t.type === 'IN' ? 'Uang Masuk (+)' : 'Uang Keluar (-)',
    Akun: t.account === 'BUSINESS' ? 'Kas Bisnis RT/RW' : 'Pribadi/Keluarga',
    Kategori: t.category,
    Nominal: t.amount,
    Catatan: t.notes || '-',
  }));
  const wsTx = XLSX.utils.json_to_sheet(txRows);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Mutasi_Transaksi');

  // Sheet 3: Status Iuran Pelanggan
  const customerRows = customers.map(c => ({
    'ID': c.id,
    'Nama Pelanggan': c.name,
    'Area RW': c.area,
    'Iuran Bulanan': c.monthly_fee,
    'Status Bayar': c.is_paid ? 'LUNAS' : 'BELUM BAYAR',
    'No HP/WhatsApp': c.phone,
    Catatan: c.notes || '-',
  }));
  const wsCust = XLSX.utils.json_to_sheet(customerRows);
  XLSX.utils.book_append_sheet(wb, wsCust, 'Data_Pelanggan');

  // Sheet 4: Kewajiban Rutin
  const billRows = bills.map((b, idx) => ({
    No: idx + 1,
    'Tagihan / Kewajiban': b.title,
    Akun: b.account === 'BUSINESS' ? 'Bisnis' : 'Pribadi',
    Nominal: b.amount,
    'Jatuh Tempo (Tanggal)': b.due_day,
    Status: b.is_paid ? 'SUDAH LUNAS' : 'BELUM DIBAYAR',
    'Terakhir Dibayar': b.last_paid_at ? formatDateIndo(b.last_paid_at) : '-',
  }));
  const wsBills = XLSX.utils.json_to_sheet(billRows);
  XLSX.utils.book_append_sheet(wb, wsBills, 'Kewajiban_Rutin');

  // Generate filename and trigger download
  const cleanMonth = month.replace(/\s+/g, '_');
  const cleanBiz = tenant.business_name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Laporan_JuraganNet_${cleanBiz}_${cleanMonth}.xlsx`;

  XLSX.writeFile(wb, filename);
}

// 2. Export to PDF (.pdf)
export function exportToPDF(data: ExportData) {
  const { tenant, month, businessSummary, personalSummary, transactions, customers, bills } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Theme (Emerald Green & Slate)
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(0, 0, 210, 32, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`LAPORAN KEUANGAN BULANAN - ${tenant.business_name.toUpperCase()}`, 14, 13);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${month}  |  Pemilik: ${tenant.owner_name}  |  Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 21);
  doc.text(`JuraganNet - PWA Manajemen RT/RW Net Siap SaaS`, 14, 27);

  let currentY = 38;

  // Section 1: Ringkasan Bisnis & Untung Bersih
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Ringkasan Arus Kas Bisnis RT/RW', 14, currentY);
  currentY += 4;

  const summaryTable = [
    ['Total Uang Masuk (Iuran & Registrasi)', formatIDR(businessSummary.totalIn)],
    ['Total Uang Keluar (Modal & Operasional)', formatIDR(businessSummary.totalOut)],
    ['SISA UNTUNG BERSIH BISNIS', formatIDR(businessSummary.netProfit)],
    ['Total Pelanggan Terdaftar', `${businessSummary.totalCustomers} Pelanggan`],
    ['Pelanggan Sudah Lunas', `${businessSummary.paidCustomers} Pelanggan (${Math.round((businessSummary.paidCustomers / (businessSummary.totalCustomers || 1)) * 100)}%)`],
    ['Pelanggan Belum Bayar', `${businessSummary.unpaidCustomers} Pelanggan`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Indikator Keuangan', 'Jumlah / Nilai']],
    body: summaryTable,
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 110 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 70 },
    },
    didParseCell: (data) => {
      if (data.row.index === 2) { // Net profit row
        data.cell.styles.fillColor = [209, 250, 229]; // light emerald
        data.cell.styles.textColor = [4, 120, 87];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 2: Kewajiban Rutin Bulan Ini
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Kewajiban Rutin Tagihan Tetap', 14, currentY);
  currentY += 4;

  const billsTable = bills.map((b, i) => [
    i + 1,
    b.title,
    formatIDR(b.amount),
    `Tgl ${b.due_day}`,
    b.is_paid ? 'LUNAS' : 'BELUM',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Nama Tagihan Pokok', 'Nominal', 'Jatuh Tempo', 'Status']],
    body: billsTable,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.column.index === 4) {
        if (data.cell.raw === 'LUNAS') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 3: Dompet Pribadi & Deteksi Bocor
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Dompet Pribadi & Deteksi Kebocoran', 14, currentY);
  currentY += 4;

  const personalTable = [
    ['Jatah Gaji dari Bisnis', formatIDR(personalSummary.salaryBudget)],
    ['Total Pengeluaran Pribadi Terpakai', formatIDR(personalSummary.totalOut)],
    ['Sisa Uang Jajan / Kebutuhan Aman', formatIDR(personalSummary.safeBalance)],
    ...personalSummary.topLeaks.map((leak, idx) => [
      `Pos Bocor #${idx + 1}: ${leak.category}`,
      `${formatIDR(leak.amount)} (${leak.percentage}%)`
    ])
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Pos Dompet Pribadi', 'Nominal']],
    body: personalTable,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 110 },
      1: { halign: 'right', cellWidth: 70 },
    },
  });

  // Page 2: Rekap Per Area RW & Transaksi Terkini
  doc.addPage();
  currentY = 16;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Rekapitulasi Iuran Pelanggan Per Area RW', 14, currentY);
  currentY += 4;

  // Group customers by area
  const areaStats: Record<string, { total: number; paid: number; collected: number; target: number }> = {};
  customers.forEach(c => {
    if (!areaStats[c.area]) {
      areaStats[c.area] = { total: 0, paid: 0, collected: 0, target: 0 };
    }
    areaStats[c.area].total += 1;
    areaStats[c.area].target += c.monthly_fee;
    if (c.is_paid) {
      areaStats[c.area].paid += 1;
      areaStats[c.area].collected += c.monthly_fee;
    }
  });

  const areaTable = Object.entries(areaStats).map(([areaName, stat], idx) => [
    idx + 1,
    areaName,
    `${stat.total} Pelanggan`,
    `${stat.paid} Lunas (${Math.round((stat.paid / stat.total) * 100)}%)`,
    stat.total - stat.paid,
    formatIDR(stat.collected),
    formatIDR(stat.target),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Area RW', 'Total', 'Lunas', 'Belum', 'Terkumpul', 'Target']],
    body: areaTable,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 45 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'right', cellWidth: 30 },
      6: { halign: 'right', cellWidth: 30 },
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 5: Daftar Mutasi Transaksi Terbaru
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Mutasi Transaksi Terkini', 14, currentY);
  currentY += 4;

  const txTable = transactions.slice(0, 30).map((t, idx) => [
    idx + 1,
    formatDateIndo(t.created_at),
    t.account === 'BUSINESS' ? 'Bisnis' : 'Pribadi',
    t.type === 'IN' ? 'MASUK' : 'KELUAR',
    t.category,
    formatIDR(t.amount),
    t.notes || '-',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Tanggal', 'Akun', 'Tipe', 'Kategori', 'Nominal', 'Catatan']],
    body: txTable,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 16 },
      3: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      4: { cellWidth: 38 },
      5: { halign: 'right', cellWidth: 25, fontStyle: 'bold' },
      6: { cellWidth: 55 },
    },
    didParseCell: (data) => {
      if (data.column.index === 3) {
        if (data.cell.raw === 'MASUK') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    }
  });

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Halaman ${i} dari ${pageCount}  |  Dokumen Resmi Laporan Keuangan JuraganNet  |  ${tenant.business_name}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save PDF
  const cleanMonth = month.replace(/\s+/g, '_');
  const cleanBiz = tenant.business_name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Laporan_JuraganNet_${cleanBiz}_${cleanMonth}.pdf`;
  doc.save(filename);
}
