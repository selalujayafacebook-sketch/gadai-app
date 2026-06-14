'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Search, Users, CheckCircle2 } from 'lucide-react'

export default function AdminNasabahPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/nasabah').then(r=>r.json())
      .then(j=>{ setUsers(j.data?.users||[]); setLoading(false) }).catch(()=>setLoading(false))
  },[])

  const filtered = users.filter(u =>
    u.nama?.toLowerCase().includes(search.toLowerCase()) ||
    u.noHp?.includes(search) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">Data Nasabah</h1><p className="page-subtitle">{users.length} nasabah terdaftar</p></div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input type="text" placeholder="Cari nama, HP, atau email..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/>
      </div>
      <div className="card overflow-hidden">
        <table className="table">
          <thead><tr><th>Nasabah</th><th>Nomor HP</th><th>Email</th><th>Status</th><th>Terdaftar</th></tr></thead>
          <tbody>
            {loading?[1,2,3,4,5].map(i=>(<tr key={i}><td colSpan={5}><div className="h-8 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>)):
              filtered.map(u=>(
                <tr key={u.id}>
                  <td><div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">{u.nama?.charAt(0).toUpperCase()}</div>
                    <span className="font-medium text-slate-900 dark:text-white">{u.nama}</span>
                  </div></td>
                  <td>{u.noHp}</td>
                  <td className="text-slate-500">{u.email||'—'}</td>
                  <td>{u.isVerified?<span className="badge badge-aktif"><CheckCircle2 size={11}/>Terverifikasi</span>:<span className="badge badge-menunggu">Belum verif</span>}</td>
                  <td className="text-slate-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading&&filtered.length===0&&(<div className="p-12 text-center"><Users size={32} className="mx-auto text-slate-300 mb-3"/><p className="text-slate-400 text-sm">Nasabah tidak ditemukan</p></div>)}
      </div>
    </div>
  )
}
