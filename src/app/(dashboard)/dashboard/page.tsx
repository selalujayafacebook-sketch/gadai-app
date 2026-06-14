'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, CreditCard, Clock, Plus, ChevronRight, AlertTriangle, TrendingUp, Bell, FileText, Calculator } from 'lucide-react'
import { formatRupiah, formatDate, sisaHari, STATUS_LABEL, STATUS_COLOR, cn } from '@/lib/utils'

export default function DashboardPage() {
  const [gadai, setGadai] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/gadai/baru').then(r => r.json()),
      fetch('/api/notifikasi').then(r => r.json()),
    ]).then(([g, n]) => {
      setGadai(g.data?.gadai || [])
      setUnread(n.data?.unreadCount || 0)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const aktif      = gadai.filter(g => g.status === 'AKTIF')
  const totalPinjaman = aktif.reduce((s, g) => s + g.jumlahPinjaman, 0)
  const totalBayar    = aktif.reduce((s, g) => s + g.totalBayar, 0)
  const terdekat   = [...aktif].sort((a, b) => new Date(a.tanggalJatuhTempo).getTime() - new Date(b.tanggalJatuhTempo).getTime())[0]
  const sisaHariJT = terdekat ? sisaHari(terdekat.tanggalJatuhTempo) : null
  const adaJatuhTempo = gadai.some(g => g.status === 'JATUH_TEMPO')

  const metrics = [
    { label:'Gadai Aktif',          value: loading ? '—' : aktif.length,                       icon: Package,     color:'text-blue-600',   bg:'bg-blue-50 dark:bg-blue-900/20' },
    { label:'Total Pinjaman',       value: loading ? '—' : formatRupiah(totalPinjaman, true),   icon: CreditCard,  color:'text-emerald-600',bg:'bg-emerald-50 dark:bg-emerald-900/20' },
    { label:'Total Pelunasan',      value: loading ? '—' : formatRupiah(totalBayar, true),      icon: TrendingUp,  color:'text-purple-600', bg:'bg-purple-50 dark:bg-purple-900/20' },
    { label:'JT Terdekat',          value: loading ? '—' : sisaHariJT !== null ? `${sisaHariJT} hari` : '—', icon: Clock, color: sisaHariJT !== null && sisaHariJT <= 7 ? 'text-amber-600' : 'text-slate-600', bg:'bg-amber-50 dark:bg-amber-900/20' },
  ]

  const quickActions = [
    { href:'/gadai/baru', icon:Plus,        label:'Ajukan Gadai',     color:'btn-primary' },
    { href:'/pembayaran', icon:CreditCard,  label:'Bayar/Tebus',      color:'btn-emerald' },
    { href:'/simulasi',   icon:Calculator,  label:'Simulasi',         color:'btn-outline' },
    { href:'/dokumen',    icon:FileText,    label:'Dokumen Saya',     color:'btn-outline' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Selamat Datang 👋</h1>
          <p className="page-subtitle">Pantau dan kelola semua transaksi gadai Anda</p>
        </div>
        <Link href="/notifikasi" className="relative btn-outline p-2.5 rounded-xl">
          <Bell size={20} />
          {unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unread}</span>}
        </Link>
      </div>

      {/* Alert jatuh tempo */}
      {adaJatuhTempo && (
        <div className="alert-warn mb-5 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Ada gadai yang sudah jatuh tempo!</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Segera lakukan pelunasan untuk menghindari denda dan lelang barang.</p>
          </div>
          <Link href="/gadai" className="btn-danger text-xs px-3 py-1.5 flex-shrink-0">Lihat</Link>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="metric-card">
            <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon size={20} className={m.color} />
            </div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value text-xl">{m.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {quickActions.map(a => (
          <Link key={a.href} href={a.href} className={`${a.color} justify-center gap-2 py-3 rounded-2xl text-sm`}>
            <a.icon size={16}/>{a.label}
          </Link>
        ))}
      </div>

      {/* Gadai aktif */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Gadai Aktif</h2>
          <Link href="/gadai" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">Semua <ChevronRight size={14}/></Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-32 skeleton rounded-2xl"/>)}</div>
        ) : aktif.length === 0 ? (
          <div className="card p-12 text-center rounded-2xl">
            <Package size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3"/>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">Belum ada gadai aktif</p>
            <p className="text-sm text-slate-400 mb-5">Ajukan gadai pertama Anda sekarang</p>
            <Link href="/gadai/baru" className="btn-primary inline-flex"><Plus size={15}/>Ajukan Gadai</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {aktif.slice(0, 3).map((g, i) => {
              const sisa = g.tanggalJatuhTempo ? sisaHari(g.tanggalJatuhTempo) : null
              const prog = g.tanggalMasuk && g.tanggalJatuhTempo
                ? Math.min(100, Math.round(((Date.now()-new Date(g.tanggalMasuk).getTime())/(new Date(g.tanggalJatuhTempo).getTime()-new Date(g.tanggalMasuk).getTime()))*100))
                : 0
              return (
                <motion.div key={g.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}>
                  <Link href={`/gadai/${g.id}`} className="card-hover block p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{g.barang?.nama||'Barang gadai'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">#{g.nomorGadai} · {g.barang?.kategori?.nama}</p>
                      </div>
                      <span className={cn('badge', STATUS_COLOR[g.status])}>{STATUS_LABEL[g.status]}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div><p className="text-slate-400">Pinjaman</p><p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatRupiah(g.jumlahPinjaman)}</p></div>
                      <div><p className="text-slate-400">Jatuh Tempo</p><p className={cn('font-bold mt-0.5', sisa!==null&&sisa<=7?'text-amber-500':'text-slate-900 dark:text-white')}>{g.tanggalJatuhTempo?formatDate(g.tanggalJatuhTempo):'—'}</p></div>
                      <div><p className="text-slate-400">Sisa Hari</p><p className={cn('font-bold mt-0.5', sisa!==null&&sisa<=0?'text-red-500':sisa!==null&&sisa<=7?'text-amber-500':'text-slate-900 dark:text-white')}>{sisa!==null?`${sisa} hari`:'—'}</p></div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-navy-700 rounded-full"><div className={cn('h-1.5 rounded-full transition-all',sisa!==null&&sisa<=7?'bg-amber-400':'bg-emerald-400')} style={{width:`${prog}%`}}/></div>
                    <p className="text-xs text-slate-400 mt-1">{prog}% tenor berlalu</p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
