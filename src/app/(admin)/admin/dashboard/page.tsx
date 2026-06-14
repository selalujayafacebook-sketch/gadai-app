'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Package, AlertTriangle, TrendingUp, Clock, ArrowUpRight } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string,string> = {MENUNGGU_VERIFIKASI:'Menunggu',DITAKSIR:'Ditaksir',DISETUJUI:'Disetujui',AKTIF:'Aktif',JATUH_TEMPO:'Jatuh Tempo',LUNAS:'Lunas',DITOLAK:'Ditolak',LELANG:'Lelang',DIPERPANJANG:'Diperpanjang',REVISI:'Revisi',MENUNGGU_PEMBAYARAN:'Menunggu Bayar'}
const STATUS_COLOR: Record<string,string> = {AKTIF:'badge-aktif',DIPERPANJANG:'badge-aktif',MENUNGGU_VERIFIKASI:'badge-menunggu',DITAKSIR:'badge-menunggu',DISETUJUI:'badge-diproses',JATUH_TEMPO:'badge-jatuh',LUNAS:'badge-lunas',DITOLAK:'badge-ditolak',LELANG:'badge-dilelang'}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r=>r.json()).then(j=>{ setData(j.data); setLoading(false) }).catch(()=>setLoading(false))
  },[])

  const stats = data?.stats||{}
  const growth = stats.pendapatanBulanLalu>0 ? Math.round(((stats.pendapatanBulanIni-stats.pendapatanBulanLalu)/stats.pendapatanBulanLalu)*100) : 0

  const metriks = [
    { label:'Total nasabah', value: loading?'—':stats.totalNasabah?.toLocaleString(), icon:Users, color:'text-blue-600', bg:'bg-blue-50 dark:bg-blue-900/20' },
    { label:'Gadai aktif', value: loading?'—':stats.totalGadaiAktif?.toLocaleString(), icon:Package, color:'text-emerald-600', bg:'bg-emerald-50 dark:bg-emerald-900/20' },
    { label:'Menunggu verifikasi', value: loading?'—':stats.totalGadaiMenunggu?.toLocaleString(), icon:Clock, color:'text-amber-600', bg:'bg-amber-50 dark:bg-amber-900/20' },
    { label:'Jatuh tempo', value: loading?'—':stats.totalGadaiJatuhTempo?.toLocaleString(), icon:AlertTriangle, color:'text-red-600', bg:'bg-red-50 dark:bg-red-900/20' },
    { label:'Total pinjaman aktif', value: loading?'—':formatRupiah(stats.totalPinjaman||0,true), icon:TrendingUp, color:'text-purple-600', bg:'bg-purple-50 dark:bg-purple-900/20', wide:true },
    { label:'Pendapatan bulan ini', value: loading?'—':formatRupiah(stats.pendapatanBulanIni||0,true), icon:TrendingUp, color:'text-blue-600', bg:'bg-blue-50 dark:bg-blue-900/20', badge: growth!==0?`${growth>0?'+':''}${growth}%`:null, wide:true },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-start mb-6">
        <div><h1 className="page-title">Dashboard Admin</h1><p className="page-subtitle">Ringkasan operasional hari ini</p></div>
        {stats.totalGadaiMenunggu>0&&(
          <Link href="/admin/gadai/verifikasi" className="btn-primary flex items-center gap-2"><Clock size={15}/>{stats.totalGadaiMenunggu} menunggu verifikasi</Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metriks.map(m=>(
          <div key={m.label} className={cn('metric-card',m.wide&&'col-span-2 lg:col-span-1')}>
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',m.bg)}><m.icon size={18} className={m.color}/></div>
              {m.badge&&<span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',growth>0?'bg-emerald-50 text-emerald-600':'bg-red-50 text-red-600')}>{m.badge} dari bulan lalu</span>}
            </div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value text-xl">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Gadai terbaru</h2>
            <Link href="/admin/gadai" className="text-xs text-primary-600 flex items-center gap-1 hover:underline">Lihat semua <ArrowUpRight size={12}/></Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {loading?[1,2,3].map(i=>(<div key={i} className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full animate-pulse"/></div>)):
              data?.gadaiTerbaru?.map((g:any)=>(
                <Link key={g.id} href={`/admin/gadai/${g.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-900 dark:text-white truncate">{g.barang?.nama||'—'}</p><p className="text-xs text-slate-400 mt-0.5">{g.user?.nama} · #{g.nomorGadai}</p></div>
                  <div className="text-right ml-4 flex-shrink-0"><span className={cn('badge',STATUS_COLOR[g.status]||'badge-lunas')}>{STATUS_LABEL[g.status]||g.status}</span><p className="text-xs text-slate-400 mt-1">{formatDate(g.createdAt)}</p></div>
                </Link>
              ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Nasabah terbaru</h2>
            <Link href="/admin/nasabah" className="text-xs text-primary-600 flex items-center gap-1 hover:underline">Lihat semua <ArrowUpRight size={12}/></Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {loading?[1,2,3].map(i=>(<div key={i} className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"/></div>)):
              data?.nasabahTerbaru?.map((u:any)=>(
                <div key={u.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-400">{u.nama.charAt(0).toUpperCase()}</div>
                    <div><p className="text-sm font-medium text-slate-900 dark:text-white">{u.nama}</p><p className="text-xs text-slate-400">{u.noHp}</p></div>
                  </div>
                  <div className="text-right"><span className={cn('badge text-xs',u.isVerified?'badge-aktif':'badge-menunggu')}>{u.isVerified?'Terverifikasi':'Belum verif'}</span><p className="text-xs text-slate-400 mt-1">{formatDate(u.createdAt)}</p></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
