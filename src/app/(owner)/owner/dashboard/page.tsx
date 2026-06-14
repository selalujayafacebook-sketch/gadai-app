'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { TrendingUp, TrendingDown, Users, Package, DollarSign, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6']

export default function OwnerDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadData() {
    setRefreshing(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/laporan?bulan=12').then(r=>r.json()),
        fetch('/api/admin/dashboard').then(r=>r.json()),
      ])
      setData({ laporan: r1.data, dashboard: r2.data })
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { loadData() }, [])

  const stats = data?.dashboard?.stats||{}
  const bulanan = data?.laporan?.bulanan||[]
  const byStatus = data?.laporan?.byStatus||[]
  const perKategori = data?.laporan?.perKategori||[]

  const pendapatanBulanIni = stats.pendapatanBulanIni||0
  const pendapatanBulanLalu = stats.pendapatanBulanLalu||0
  const growth = pendapatanBulanLalu>0 ? ((pendapatanBulanIni-pendapatanBulanLalu)/pendapatanBulanLalu*100).toFixed(1) : '0'

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="page-title">Business Overview</h1><p className="page-subtitle">Monitoring bisnis dan keuangan perusahaan secara real-time</p></div>
        <button onClick={loadData} disabled={refreshing} className="btn-secondary gap-2"><RefreshCw size={15} className={cn(refreshing&&'animate-spin')}/>Refresh</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Omset (12 bln)', value: formatRupiah(bulanan.reduce((s:number,b:any)=>s+b.totalPinjaman,0),true), icon:DollarSign, color:'text-blue-600', bg:'bg-blue-50 dark:bg-blue-900/20', trend:null },
          { label:'Pendapatan Bulan Ini', value: formatRupiah(pendapatanBulanIni,true), icon:TrendingUp, color:'text-emerald-600', bg:'bg-emerald-50 dark:bg-emerald-900/20', trend:{value:parseFloat(growth),label:'vs bln lalu'} },
          { label:'Total Nasabah', value:(stats.totalNasabah||0).toLocaleString(), icon:Users, color:'text-purple-600', bg:'bg-purple-50 dark:bg-purple-900/20', trend:null },
          { label:'Outstanding Loan', value: formatRupiah(stats.totalPinjaman||0,true), icon:Package, color:'text-amber-600', bg:'bg-amber-50 dark:bg-amber-900/20', trend:null },
        ].map(s=>(
          <div key={s.label} className="metric-card">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center',s.bg)}><s.icon size={20} className={s.color}/></div>
              {s.trend&&(
                <span className={cn('text-xs font-semibold px-2 py-1 rounded-full',s.trend.value>=0?'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20':'bg-red-50 text-red-600 dark:bg-red-900/20')}>
                  {s.trend.value>=0?'↑':'↓'} {Math.abs(s.trend.value)}% {s.trend.label}
                </span>
              )}
            </div>
            <div className="metric-label">{s.label}</div><div className="metric-value text-xl">{loading?'—':s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-1">Tren Pendapatan 12 Bulan</h3>
          <p className="text-xs text-slate-400 mb-4">Pendapatan bunga dan total pinjaman baru</p>
          {loading?<div className="h-52 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={bulanan}>
                <defs><linearGradient id="pendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="bulan" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`${(v/1e6).toFixed(0)}jt`}/>
                <Tooltip formatter={(v:number)=>formatRupiah(v)}/>
                <Area type="monotone" dataKey="pendapatan" stroke="#2563eb" fill="url(#pendGrad)" strokeWidth={2} name="Pendapatan"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Distribusi Gadai</h3>
          {loading?<div className="h-52 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={byStatus} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                  {byStatus.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie><Tooltip/></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {byStatus.slice(0,5).map((s:any,i:number)=>(
                  <div key={s.status} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                    <span className="text-slate-500 flex-1 truncate">{s.status}</span><span className="font-bold">{s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="section-title mb-4">Pengajuan & Pelunasan per Bulan</h3>
          {loading?<div className="h-48 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={bulanan.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="bulan" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/>
                <Bar dataKey="totalPengajuan" fill="#2563eb" radius={[4,4,0,0]} name="Pengajuan"/>
                <Bar dataKey="gadaiDitebus" fill="#10b981" radius={[4,4,0,0]} name="Ditebus"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Gadai per Kategori Barang</h3>
          {loading?<div className="h-48 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={perKategori} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:10}}/><YAxis dataKey="nama" type="category" tick={{fontSize:10}} width={80}/><Tooltip/>
                <Bar dataKey="total" fill="#8b5cf6" radius={[0,4,4,0]} name="Jumlah"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {stats.totalGadaiJatuhTempo>0&&(
        <div className="alert-warn flex items-center gap-3">
          <TrendingDown size={18} className="text-amber-600 flex-shrink-0"/>
          <div><p className="font-semibold">⚠️ {stats.totalGadaiJatuhTempo} gadai sudah jatuh tempo</p><p className="text-sm mt-0.5">Segera tindak lanjuti untuk menghindari risiko gagal bayar dan lelang.</p></div>
        </div>
      )}
    </div>
  )
}
