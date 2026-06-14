'use client'
import { useState } from 'react'
import { Calculator, TrendingUp } from 'lucide-react'
import { formatRupiah, hitungBunga } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function SimulasiPage() {
  const [nilai, setNilai] = useState(5_000_000)
  const [tenor, setTenor] = useState(30)
  const [bunga, setBunga] = useState(1.5)
  const [persen, setPersen] = useState(75)

  const pinjaman = Math.round(nilai * persen / 100)
  const { totalBunga, totalBayar } = hitungBunga({ jumlahPinjaman: pinjaman, bungaPerBulan: bunga, tenor })
  const jatuhTempo = new Date(); jatuhTempo.setDate(jatuhTempo.getDate() + tenor)
  const dendaHarian = Math.round(pinjaman * 0.001)

  const hasil = [
    { label: 'Dana diterima', value: formatRupiah(pinjaman), color: 'text-blue-600' },
    { label: `Bunga ${tenor} hari`, value: formatRupiah(totalBunga), color: 'text-amber-600' },
    { label: 'Total pelunasan', value: formatRupiah(totalBayar), color: 'text-emerald-600' },
    { label: 'Denda/hari (jika terlambat)', value: formatRupiah(dendaHarian), color: 'text-red-500' },
  ]

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6"><h1 className="page-title">Kalkulator Simulasi Gadai</h1><p className="page-subtitle">Hitung estimasi pinjaman dan cicilan sebelum mengajukan</p></div>
      <div className="space-y-5">
        <div className="card p-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2"><label className="label mb-0">Nilai Barang</label><span className="font-bold text-blue-600">{formatRupiah(nilai)}</span></div>
            <input type="range" min="500000" max="100000000" step="500000" value={nilai} onChange={e=>setNilai(+e.target.value)} className="w-full accent-blue-600"/>
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>Rp 500 rb</span><span>Rp 100 jt</span></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2"><label className="label mb-0">Tenor Gadai</label><span className="font-bold text-blue-600">{tenor} hari</span></div>
            <input type="range" min="7" max="120" value={tenor} onChange={e=>setTenor(+e.target.value)} className="w-full accent-blue-600"/>
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>7 hari</span><span>120 hari</span></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2"><label className="label mb-0">Bunga per Bulan</label><span className="font-bold text-blue-600">{bunga}%</span></div>
            <div className="flex gap-2">{[1,1.5,2,2.5,3].map(b=>(
              <button key={b} onClick={()=>setBunga(b)} className={cn('flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all',bunga===b?'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700':'border-slate-200 dark:border-gray-700 text-slate-500')}>{b}%</button>
            ))}</div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2"><label className="label mb-0">% Pinjaman dari Nilai</label><span className="font-bold text-blue-600">{persen}%</span></div>
            <div className="flex gap-2">{[60,70,75,80,85].map(p=>(
              <button key={p} onClick={()=>setPersen(p)} className={cn('flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all',persen===p?'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700':'border-slate-200 dark:border-gray-700 text-slate-500')}>{p}%</button>
            ))}</div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><Calculator size={18} className="text-blue-600"/>Hasil Kalkulasi</h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {hasil.map(c=>(
              <div key={c.label} className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 mb-1">{c.label}</p><p className={cn('font-bold text-lg',c.color)}>{c.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-sm space-y-2 border border-blue-100 dark:border-blue-800">
            <div className="flex justify-between"><span className="text-slate-500">Estimasi jatuh tempo</span><span className="font-semibold text-slate-900 dark:text-white">{jatuhTempo.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bunga per hari</span><span className="font-semibold">{formatRupiah(Math.round(pinjaman*bunga/100/30))}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Nilai taksiran petugas</span><span className="text-xs text-amber-600 font-medium">Ditentukan saat verifikasi</span></div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-gray-800"><h2 className="section-title flex items-center gap-2"><TrendingUp size={16} className="text-blue-600"/>Rincian Biaya</h2></div>
          <table className="table">
            <thead><tr><th>Komponen</th><th>Nilai</th><th>Keterangan</th></tr></thead>
            <tbody>
              <tr><td>Pokok pinjaman</td><td className="font-semibold">{formatRupiah(pinjaman)}</td><td className="text-slate-400 text-xs">{persen}% dari taksiran</td></tr>
              <tr><td>Total bunga</td><td className="font-semibold text-amber-600">{formatRupiah(totalBunga)}</td><td className="text-slate-400 text-xs">{bunga}%/bln × {tenor} hari</td></tr>
              <tr><td>Biaya admin</td><td className="font-semibold">Rp 0</td><td className="text-slate-400 text-xs">Gratis</td></tr>
              <tr><td className="font-bold">Total pelunasan</td><td className="font-bold text-blue-600">{formatRupiah(totalBayar)}</td><td className="text-slate-400 text-xs">Jika lunas tepat waktu</td></tr>
            </tbody>
          </table>
        </div>

        <div className="alert-info text-xs">ℹ️ Simulasi bersifat estimasi. Nilai pinjaman dan bunga final ditentukan petugas setelah verifikasi barang.</div>
        <Link href="/gadai/baru" className="btn-primary w-full btn-lg justify-center gap-2"><Calculator size={18}/>Ajukan Gadai Sekarang</Link>
      </div>
    </div>
  )
}
