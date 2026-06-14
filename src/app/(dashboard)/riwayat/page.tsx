'use client'
import { useEffect, useState } from 'react'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { History, Package, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'

const STATUS_LABEL: Record<string,string> = {AKTIF:'Aktif',LUNAS:'Lunas',DITOLAK:'Ditolak',JATUH_TEMPO:'Jatuh Tempo',DIPERPANJANG:'Diperpanjang',MENUNGGU_VERIFIKASI:'Menunggu',DITAKSIR:'Ditaksir',DISETUJUI:'Disetujui',LELANG:'Lelang'}
const STATUS_COLOR: Record<string,string> = {AKTIF:'badge-aktif',DIPERPANJANG:'badge-aktif',LUNAS:'badge-lunas',DITOLAK:'badge-ditolak',JATUH_TEMPO:'badge-jatuh',LELANG:'badge-dilelang',MENUNGGU_VERIFIKASI:'badge-menunggu',DITAKSIR:'badge-menunggu',DISETUJUI:'badge-diproses'}

export default function RiwayatPage() {
  const [gadai, setGadai] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gadai/baru?limit=50').then(r=>r.json())
      .then(j=>{ setGadai(j.data?.gadai||[]); setLoading(false) })
      .catch(()=>setLoading(false))
  },[])

  const getIcon = (status: string) => ({
    AKTIF:<CheckCircle2 size={18} className="text-emerald-500"/>,DIPERPANJANG:<RefreshCw size={18} className="text-blue-500"/>,
    LUNAS:<CheckCircle2 size={18} className="text-slate-400"/>,MENUNGGU_VERIFIKASI:<Clock size={18} className="text-amber-500"/>,
    DITAKSIR:<Clock size={18} className="text-amber-500"/>,DITOLAK:<XCircle size={18} className="text-red-500"/>,
    JATUH_TEMPO:<Clock size={18} className="text-red-500"/>,
  }[status]||<Package size={18} className="text-slate-400"/>)

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">Riwayat Transaksi</h1><p className="page-subtitle">Semua aktivitas gadai dan pembayaran Anda</p></div>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div>
      ) : gadai.length===0 ? (
        <div className="card p-16 text-center"><History size={40} className="mx-auto text-slate-300 mb-3"/><p className="font-semibold text-slate-900 dark:text-white mb-1">Belum ada riwayat</p><p className="text-sm text-slate-400">Riwayat gadai akan muncul di sini</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-50 dark:divide-gray-800">
            {gadai.map(g=>(
              <div key={g.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">{getIcon(g.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{g.barang?.nama||'Barang gadai'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">#{g.nomorGadai} · {formatDateTime(g.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn('font-bold text-sm',['AKTIF','DIPERPANJANG','MENUNGGU_VERIFIKASI'].includes(g.status)?'text-blue-600':'text-slate-900 dark:text-white')}>{formatRupiah(g.jumlahPinjaman)}</p>
                  <span className={cn('badge text-xs mt-1',STATUS_COLOR[g.status]||'badge-lunas')}>{STATUS_LABEL[g.status]||g.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
