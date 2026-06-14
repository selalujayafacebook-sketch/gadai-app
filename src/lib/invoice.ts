import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function generateNomorInvoice(prefix = 'INV'): string {
  const date = format(new Date(), 'yyyyMMdd')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${date}-${rand}`
}

export interface InvoiceData {
  nomorInvoice: string; nomorGadai: string; tanggal: Date
  nasabah: { nama: string; noHp: string; nik?: string; alamat?: string }
  barang: { nama: string; kategori: string; kondisi: string }
  items: { deskripsi: string; jumlah: number; qty?: number }[]
  subtotal: number; bunga: number; denda: number; biayaAdmin: number; total: number
  metodePembayaran?: string
  perusahaan: { nama: string; alamat?: string; telepon?: string; email?: string }
  footer?: string; jenis: string
}

export function generateInvoiceHTML(d: InvoiceData): string {
  const tgl = format(d.tanggal, 'dd MMMM yyyy', { locale: id })
  const rp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Invoice ${d.nomorInvoice}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:32px}
.header{display:flex;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #2563eb}
.logo{width:48px;height:48px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px}
.co-name{font-size:20px;font-weight:900;color:#1e40af}.co-sub{font-size:11px;color:#64748b;margin-top:2px}
.inv-title h2{font-size:18px;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:2px;text-align:right}
.inv-title p{font-size:11px;color:#64748b;text-align:right;margin-top:2px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.meta-box{background:#f8fafc;border-radius:10px;padding:14px;border:1px solid #e2e8f0}
.meta-box h4{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.meta-row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px}
.ml{color:#64748b}.mv{font-weight:600}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th{background:#1e40af;color:#fff;padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase}
td{padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:12px}
.tot-section{display:flex;justify-content:flex-end;margin-bottom:24px}
.tot-box{background:#1e293b;color:#fff;border-radius:12px;padding:18px 24px;min-width:260px}
.tr{display:flex;justify-content:space-between;margin-bottom:7px;font-size:12px}
.tr.main{font-size:15px;font-weight:800;border-top:1px solid rgba(255,255,255,.2);padding-top:10px;margin-top:6px}
.footer{text-align:center;padding-top:18px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}
.badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;background:#dcfce7;color:#166534}
</style></head><body>
<div class="header">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="logo">G</div>
    <div><div class="co-name">${d.perusahaan.nama}</div><div class="co-sub">${d.perusahaan.alamat||''}</div><div class="co-sub">${d.perusahaan.telepon||''}</div></div>
  </div>
  <div class="inv-title">
    <h2>Invoice</h2><p>${d.nomorInvoice}</p><p>${tgl}</p>
    <span class="badge" style="margin-top:6px">LUNAS</span>
  </div>
</div>
<div class="meta">
  <div class="meta-box"><h4>Data Nasabah</h4>
    <div class="meta-row"><span class="ml">Nama</span><span class="mv">${d.nasabah.nama}</span></div>
    <div class="meta-row"><span class="ml">No. HP</span><span class="mv">${d.nasabah.noHp}</span></div>
    ${d.nasabah.alamat?`<div class="meta-row"><span class="ml">Alamat</span><span class="mv">${d.nasabah.alamat}</span></div>`:''}
  </div>
  <div class="meta-box"><h4>Detail Transaksi</h4>
    <div class="meta-row"><span class="ml">No. Gadai</span><span class="mv">${d.nomorGadai}</span></div>
    <div class="meta-row"><span class="ml">Jenis</span><span class="mv">${d.jenis}</span></div>
    <div class="meta-row"><span class="ml">Barang</span><span class="mv">${d.barang.nama}</span></div>
    ${d.metodePembayaran?`<div class="meta-row"><span class="ml">Metode</span><span class="mv">${d.metodePembayaran}</span></div>`:''}
  </div>
</div>
<table>
  <thead><tr><th>Deskripsi</th><th style="text-align:right">Jumlah</th></tr></thead>
  <tbody>${d.items.map(i=>`<tr><td>${i.deskripsi}</td><td style="text-align:right">${rp(i.jumlah)}</td></tr>`).join('')}</tbody>
</table>
<div class="tot-section"><div class="tot-box">
  <div class="tr"><span>Subtotal</span><span>${rp(d.subtotal)}</span></div>
  ${d.bunga>0?`<div class="tr"><span>Bunga</span><span>${rp(d.bunga)}</span></div>`:''}
  ${d.denda>0?`<div class="tr" style="color:#fca5a5"><span>Denda</span><span>${rp(d.denda)}</span></div>`:''}
  ${d.biayaAdmin>0?`<div class="tr"><span>Biaya Admin</span><span>${rp(d.biayaAdmin)}</span></div>`:''}
  <div class="tr main"><span>TOTAL BAYAR</span><span>${rp(d.total)}</span></div>
</div></div>
<div class="footer"><p>${d.footer||'Terima kasih telah mempercayakan GadaiKu sebagai mitra keuangan Anda.'}</p>
<p style="margin-top:4px">Invoice ini sah tanpa tanda tangan · ${d.perusahaan.nama} © ${new Date().getFullYear()}</p></div>
</body></html>`
}
