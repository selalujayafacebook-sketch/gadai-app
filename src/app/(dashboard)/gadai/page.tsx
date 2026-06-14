'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Package, Search, ChevronRight } from 'lucide-react'
import { formatRupiah, formatDate, sisaHari } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string,string> = {
  MENUNGGU_VERIFIKASI:'Menunggu',DITAKSIR:'Ditaksir',DISETUJUI:'Disetujui',
  DITOLAK:'Ditolak',REVISI:'Revisi',MENUNGGU_PEMBAYARAN:'Menunggu Bayar',
  AKTIF:'Aktif',JATUH_TEMPO:'Jatuh Tempo',DIPERPANJANG:'Diperpanjang',LUNAS:'Lunas',LELANG:'Lelang'
}
const STATUS_COLOR: Record<string,string> = {
  AKTIF:'badge-aktif',DIPERPANJANG:'badge-aktif',MENUNGGU_VERIFIKASI:'badge-menunggu',
  DITAKSIR:'badge-menunggu',DISETUJUI:'badge-diproses',MENUNGGU_PEMBAYARAN:'badge-menunggu',
  JATUH_TEMPO:'badge-jatuh',LUNAS:'badge-lunas',DITOLAK:'badge-ditolak',LELANG:'badge-dilelang',REVISI:'badge-menunggu'
}
const TABS = ['Semua','AKTIF','MENUNGGU_VERIFIKASI','JATUH_TEMPO','LUNAS','DITOLAK']

export default function GadaiPage() {
  const [gadai, setGadai] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Semua')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const q = tab !== 'Semua' ? `?status=${tab}` : ''
    fetch(`/api/gadai/baru${q}`)
      .then(r => r.json()).then(j => { setGadai(j.data?.gadai || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tab])

  const filtered = gadai.filter(g =>
    !search || g.nomorGadai?.toLowerCase().includes(search.toLowerCase()) ||
    g.barang?.nama?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="page-title">Gadai Saya</h1><p className="page-subtitle">Kelola semua pengajuan gadai Anda</p></div>
        <Link href="/gadai/baru" className="btn-primary gap-2"><Plus size={16}/>Ajukan Gadai</Link>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input type="text" placeholder="Cari nomor gadai atau barang..." value={search}
          onChange={e => setSearch(e.target.value)} className="input pl-10"/>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-thin">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all',
              tab===t?'bg-blue-600 text-white':'bg-white dark:bg-gray-800 text-slate-500 border border-slate-200 dark:border-gray-700')}>
            {t==='Semua'?'Semua':STATUS_LABEL[t]||t}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-32 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3"/>
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Belum ada gadai</p>
          <p className="text-sm text-slate-400 mb-5">Ajukan gadai pertama Anda sekarang</p>
          <Link href="/gadai/baru" className="btn-primary inline-flex gap-2"><Plus size={15}/>Ajukan Gadai</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(g => {
            const sisa = g.tanggalJatuhTempo ? sisaHari(g.tanggalJatuhTempo) : null
            const progress = g.tanggalMasuk && g.tanggalJatuhTempo
              ? Math.min(100, Math.round(((Date.now()-new Date(g.tanggalMasuk).getTime())/(new Date(g.tanggalJatuhTempo).getTime()-new Date(g.tanggalMasuk).getTime()))*100)) : 0
            return (
              <Link key={g.id} href={`/gadai/${g.id}`} className="card-hover block p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-blue-600"/>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{g.barang?.nama||'Barang gadai'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">#{g.nomorGadai} · {g.barang?.kategori?.nama}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('badge',STATUS_COLOR[g.status]||'badge-lunas')}>{STATUS_LABEL[g.status]||g.status}</span>
                    <ChevronRight size={16} className="text-slate-300"/>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div><p className="text-slate-400">Pinjaman</p><p className="font-semibold text-slate-900 dark:text-white mt-0.5">{formatRupiah(g.jumlahPinjaman)}</p></div>
                  <div><p className="text-slate-400">Jatuh Tempo</p><p className={cn('font-semibold mt-0.5',sisa!==null&&sisa<=7?'text-amber-500':'text-slate-900 dark:text-white')}>{g.tanggalJatuhTempo?formatDate(g.tanggalJatuhTempo):'—'}</p></div>
                  <div><p className="text-slate-400">Sisa Hari</p><p className={cn('font-semibold mt-0.5',sisa!==null&&sisa<=7?'text-amber-500':sisa!==null&&sisa<0?'text-red-500':'text-slate-900 dark:text-white')}>{sisa!==null?`${sisa} hari`:'—'}</p></div>
                </div>
                {['AKTIF','DIPERPANJANG'].includes(g.status)&&(
                  <div>
                    <div className="h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full">
                      <div className={cn('h-1.5 rounded-full',sisa!==null&&sisa<=7?'bg-amber-400':'bg-emerald-400')} style={{width:`${progress}%`}}/>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{progress}% tenor berlalu</p>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
