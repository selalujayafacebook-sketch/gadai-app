'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'

export default function OwnerLaporanPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(12)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/laporan?bulan=${range}`).then(r=>r.json())
      .then(j=>{ setData(j.data); setLoading(false) }).catch(()=>setLoading(false))
  },[range])

  const bulanan = data?.bulanan||[]
  const summary = data?.summary||{}

  function exportCSV() {
    const rows = [['Bulan','Pengajuan','Aktif','Ditebus','Total Pinjaman','Pendapatan'],
      ...bulanan.map((b:any)=>[b.bulan,b.totalPengajuan,b.gadaiAktif,b.gadaiDitebus,b.totalPinjaman,b.pendapatan])]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`laporan-gadaiku-${range}bulan.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const totalRevenue = bulanan.reduce((s:number,b:any)=>s+b.pendapatan,0)
  const totalLoan = bulanan.reduce((s:number,b:any)=>s+b.totalPinjaman,0)
  const bulanIni = bulanan[bulanan.length-1]||{}
  const bulanLalu = bulanan[bulanan.length-2]||{}
  const growth = bulanLalu.pendapatan>0 ? ((bulanIni.pendapatan-bulanLalu.pendapatan)/bulanLalu.pendapatan*100).toFixed(1) : '0'

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="page-title">Laporan Keuangan</h1><p className="page-subtitle">Analisis finansial dan performa bisnis</p></div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-gray-800 rounded-xl p-1">
            {[3,6,12].map(r=>(<button key={r} onClick={()=>setRange(r)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${range===r?'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white':'text-slate-500'}`}>{r} Bln</button>))}
          </div>
          <button onClick={exportCSV} className="btn-outline gap-2 text-sm"><Download size={14}/>Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:`Total Revenue (${range} bln)`, value: formatRupiah(totalRevenue,true), trend:null },
          { label:'Revenue Bulan Ini', value: formatRupiah(bulanIni.pendapatan||0,true), trend:growth, positive:parseFloat(growth)>=0 },
          { label:'Outstanding Loan', value: formatRupiah(summary.totalPinjaman||0,true), trend:null },
          { label:'Total Pinjaman Disalurkan', value: formatRupiah(totalLoan,true), trend:null },
        ].map(s=>(
          <div key={s.label} className="metric-card">
            <div className="metric-label">{s.label}</div>
            <div className="metric-value text-xl mt-1">{loading?'—':s.value}</div>
            {s.trend!==null&&!loading&&(
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${s.positive?'text-emerald-600':'text-red-500'}`}>
                {s.positive?<TrendingUp size={13}/>:<TrendingDown size={13}/>}{Math.abs(parseFloat(s.trend as string))}% vs bulan lalu
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="section-title mb-4">Tren Revenue & Pinjaman</h3>
          {loading?<div className="h-52 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={bulanan}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                  <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="bulan" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`${(v/1e6).toFixed(0)}jt`}/>
                <Tooltip formatter={(v:number,n:string)=>[formatRupiah(v),n]}/><Legend/>
                <Area type="monotone" dataKey="pendapatan" stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2} name="Revenue"/>
                <Area type="monotone" dataKey="totalPinjaman" stroke="#10b981" fill="url(#loanGrad)" strokeWidth={2} name="Pinjaman"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Volume Transaksi per Bulan</h3>
          {loading?<div className="h-52 bg-slate-100 dark:bg-gray-800 rounded-xl animate-pulse"/>:(
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bulanan.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="bulan" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Legend/>
                <Bar dataKey="totalPengajuan" fill="#2563eb" radius={[4,4,0,0]} name="Pengajuan"/>
                <Bar dataKey="gadaiDitebus" fill="#10b981" radius={[4,4,0,0]} name="Ditebus"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="section-title">Detail Bulanan</h3>
          <button onClick={exportCSV} className="btn-outline text-xs gap-1.5 py-1.5"><Download size={12}/>Export</button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Bulan</th><th className="text-right">Pengajuan</th><th className="text-right">Aktif</th><th className="text-right">Ditebus</th><th className="text-right">Total Pinjaman</th><th className="text-right">Revenue</th><th className="text-right">Growth</th></tr></thead>
            <tbody>
              {loading?[1,2,3].map(i=>(<tr key={i}><td colSpan={7}><div className="h-6 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>)):
                bulanan.map((b:any,i:number)=>{
                  const prev = bulanan[i-1]
                  const gr = prev&&prev.pendapatan>0 ? ((b.pendapatan-prev.pendapatan)/prev.pendapatan*100).toFixed(1) : null
                  return (
                    <tr key={b.bulan}>
                      <td className="font-semibold">{b.bulan}</td><td className="text-right">{b.totalPengajuan}</td><td className="text-right">{b.gadaiAktif}</td>
                      <td className="text-right">{b.gadaiDitebus}</td><td className="text-right">{formatRupiah(b.totalPinjaman,true)}</td>
                      <td className="text-right font-semibold text-emerald-600">{formatRupiah(b.pendapatan,true)}</td>
                      <td className="text-right">{gr!==null&&<span className={`text-xs font-semibold ${parseFloat(gr)>=0?'text-emerald-600':'text-red-500'}`}>{parseFloat(gr)>=0?'+':''}{gr}%</span>}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
