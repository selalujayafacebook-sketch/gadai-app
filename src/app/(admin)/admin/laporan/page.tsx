'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { TrendingUp, Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function LaporanPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(6)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/laporan?bulan=${range}`).then(r=>r.json())
      .then(j=>{ setData(j.data); setLoading(false) }).catch(()=>setLoading(false))
  }, [range])

  const summary = data?.summary||{}
  const bulanan = data?.bulanan||[]
  const byStatus = data?.byStatus||[]
  const perKategori = data?.perKategori||[]

  function exportCSV() {
    const rows = [['Bulan','Total Pengajuan','Gadai Aktif','Ditebus','Pendapatan','Total Pinjaman'],
      ...bulanan.map((b:any)=>[b.bulan,b.totalPengajuan,b.gadaiAktif,b.gadaiDitebus,b.pendapatan,b.totalPinjaman])]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='laporan-gadai.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="page-title">Laporan Keuangan</h1><p className="page-subtitle">Analisis performa dan keuangan platform</p></div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-gray-800 rounded-xl p-1">
            {[3,6,12].map(r=>(
              <button key={r} onClick={()=>setRange(r)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all',range===r?'bg-white dark:bg-gray-700 shadow-sm text-slate-900 dark:text-white':'text-slate-500')}>{r} Bln</button>
            ))}
          </div>
          <button onClick={exportCSV} className="btn-outline gap-2 text-sm"><Download size={15}/>Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Nasabah', value: loading?'—':summary.totalNasabah?.toLocaleString(), icon:'👥' },
          { label:'Total Gadai', value: loading?'—':summary.totalGadai?.toLocaleString(), icon:'📦' },
          { label:'Total Pinjaman Aktif', value: loading?'—':formatRupiah(summary.totalPinjaman||0,true), icon:'💳' },
          { label:'Total Pendapatan', value: loading?'—':formatRupiah(summary.totalPendapatan||0,true), icon:'💰' },
        ].map(s=>(
          <div key={s.label} className="metric-card"><div className="text-2xl mb-2">{s.icon}</div><div className="metric-label">{s.label}</div><div className="metric-value text-xl">{s.value}</div></div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-600"/>Pendapatan Bulanan</h3>
          {loading?<div className="h-48 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bulanan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="bulan" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}} tickFormatter={v=>`${(v/1000000).toFixed(0)}jt`}/>
                <Tooltip formatter={(v:number)=>formatRupiah(v)}/>
                <Bar dataKey="pendapatan" fill="#2563eb" radius={[4,4,0,0]} name="Pendapatan"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Pengajuan & Pinjaman</h3>
          {loading?<div className="h-48 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bulanan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="bulan" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip/><Legend/>
                <Line type="monotone" dataKey="totalPengajuan" stroke="#2563eb" name="Pengajuan" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="gadaiDitebus" stroke="#10b981" name="Ditebus" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-4">Distribusi Status Gadai</h3>
          {loading?<div className="h-48 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={byStatus} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={70}>
                    {byStatus.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {byStatus.map((s:any,i:number)=>(
                  <div key={s.status} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                    <span className="text-slate-600 dark:text-slate-400 truncate">{s.status}</span>
                    <span className="font-bold ml-auto">{s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Gadai per Kategori</h3>
          {loading?<div className="h-48 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={perKategori} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:11}}/>
                <YAxis dataKey="nama" type="category" tick={{fontSize:11}} width={80}/>
                <Tooltip/>
                <Bar dataKey="total" fill="#8b5cf6" radius={[0,4,4,0]} name="Jumlah"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card overflow-hidden mt-5">
        <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex items-center gap-2"><FileText size={16} className="text-blue-600"/><h3 className="section-title">Detail Bulanan</h3></div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Bulan</th><th>Pengajuan</th><th>Aktif</th><th>Ditebus</th><th>Total Pinjaman</th><th>Pendapatan</th></tr></thead>
            <tbody>
              {loading?[1,2,3].map(i=>(<tr key={i}><td colSpan={6}><div className="h-6 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>)):
                bulanan.map((b:any)=>(
                  <tr key={b.bulan}>
                    <td className="font-medium">{b.bulan}</td><td>{b.totalPengajuan}</td><td>{b.gadaiAktif}</td><td>{b.gadaiDitebus}</td>
                    <td>{formatRupiah(b.totalPinjaman,true)}</td><td className="font-semibold text-emerald-600">{formatRupiah(b.pendapatan,true)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
