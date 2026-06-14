'use client'
import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'

export default function OwnerCabangPage() {
  const [cabang, setCabang] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/cabang').then(r=>r.json())
      .then(j=>{ setCabang(j.data?.cabang||[]); setLoading(false) }).catch(()=>setLoading(false))
  },[])

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">Statistik Cabang</h1><p className="page-subtitle">Performa dan data setiap cabang GadaiKu</p></div>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-48 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cabang.map(c=>(
            <div key={c.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Building2 size={22} className="text-blue-600"/></div>
                <div><p className="font-bold text-slate-900 dark:text-white">{c.nama}</p><p className="text-xs text-slate-400 font-mono">{c.kode}</p></div>
              </div>
              <div className="space-y-2.5 text-sm">
                {c.kota&&<div className="flex justify-between"><span className="text-slate-400">Kota</span><span className="font-semibold">{c.kota}</span></div>}
                <div className="flex justify-between"><span className="text-slate-400">Karyawan</span><span className="font-bold text-blue-600">{c._count?.users||0}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Gadai</span><span className="font-bold text-emerald-600">{c._count?.gadai||0}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className={`badge text-xs ${c.isActive?'badge-aktif':'badge-ditolak'}`}>{c.isActive?'Aktif':'Nonaktif'}</span></div>
              </div>
            </div>
          ))}
          {cabang.length===0&&(
            <div className="card p-16 text-center col-span-full">
              <Building2 size={40} className="mx-auto text-slate-300 mb-3"/>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Belum ada cabang</p>
              <p className="text-sm text-slate-400">Tambahkan cabang melalui Admin Panel</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
