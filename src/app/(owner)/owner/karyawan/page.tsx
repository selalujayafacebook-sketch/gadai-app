'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Users, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks'

const ROLE_COLOR: Record<string,string> = { PETUGAS:'badge-diproses', SUPERVISOR:'badge-menunggu', ADMIN:'badge-aktif', OWNER:'badge-ditolak' }

export default function OwnerKaryawanPage() {
  const [karyawan, setKaryawan] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const dSearch = useDebounce(search)

  useEffect(() => {
    fetch('/api/admin/karyawan').then(r=>r.json())
      .then(j=>{ setKaryawan(j.data?.karyawan||[]); setLoading(false) }).catch(()=>setLoading(false))
  },[])

  const filtered = karyawan.filter(k =>
    !dSearch || k.nama?.toLowerCase().includes(dSearch.toLowerCase()) ||
    k.noHp?.includes(dSearch) || k.email?.toLowerCase().includes(dSearch.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">Data Karyawan</h1><p className="page-subtitle">{karyawan.length} karyawan terdaftar di semua cabang</p></div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input type="text" placeholder="Cari nama, HP, atau email karyawan..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/>
      </div>
      <div className="card overflow-hidden">
        <table className="table">
          <thead><tr><th>Karyawan</th><th>Role</th><th>Cabang</th><th>Status</th><th>Bergabung</th></tr></thead>
          <tbody>
            {loading?[1,2,3,4].map(i=>(<tr key={i}><td colSpan={5}><div className="h-8 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>)):
              filtered.map(k=>(
                <tr key={k.id}>
                  <td><div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{k.nama?.charAt(0).toUpperCase()}</div>
                    <div><p className="font-semibold text-sm text-slate-900 dark:text-white">{k.nama}</p><p className="text-xs text-slate-400">{k.email||k.noHp}</p></div>
                  </div></td>
                  <td><span className={cn('badge text-xs',ROLE_COLOR[k.role]||'badge-lunas')}>{k.role}</span></td>
                  <td className="text-sm text-slate-500">{k.cabang?.nama||'—'}</td>
                  <td><span className={cn('badge text-xs',k.isActive?'badge-aktif':'badge-ditolak')}>{k.isActive?'Aktif':'Nonaktif'}</span></td>
                  <td className="text-sm text-slate-400">{formatDate(k.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading&&filtered.length===0&&(<div className="p-12 text-center"><Users size={32} className="mx-auto text-slate-300 mb-3"/><p className="text-slate-400 text-sm">Tidak ada karyawan ditemukan</p></div>)}
      </div>
    </div>
  )
}
