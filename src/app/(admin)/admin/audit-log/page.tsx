'use client'
// src/app/(admin)/admin/audit-log/page.tsx
import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { Shield, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks'

const MODUL_COLORS: Record<string, string> = {
  AUTH: 'badge-diproses', GADAI: 'badge-menunggu', PEMBAYARAN: 'badge-aktif',
  NASABAH: 'badge-lunas', PENGATURAN: 'badge-jatuh', INVOICE: 'badge-aktif',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modul, setModul] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const dSearch = useDebounce(search)

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ page: String(page), limit: '50' })
    if (modul) q.set('modul', modul)
    fetch(`/api/admin/audit-log?${q}`)
      .then(r => r.json())
      .then(j => { setLogs(j.data?.logs || []); setTotal(j.data?.pagination?.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [modul, page])

  const filtered = logs.filter(l =>
    !dSearch ||
    l.aksi?.toLowerCase().includes(dSearch.toLowerCase()) ||
    l.user?.nama?.toLowerCase().includes(dSearch.toLowerCase()) ||
    l.targetId?.toLowerCase().includes(dSearch.toLowerCase())
  )

  const MODULS = ['AUTH', 'GADAI', 'PEMBAYARAN', 'NASABAH', 'PENGATURAN', 'INVOICE']

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Rekam jejak semua aktivitas sistem · {total} entri</p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari aksi, user, atau target..." value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={modul} onChange={e => { setModul(e.target.value); setPage(1) }} className="input w-auto">
          <option value="">Semua Modul</option>
          {MODULS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>Waktu</th><th>User</th><th>Modul</th><th>Aksi</th><th>Target</th><th>IP</th></tr>
          </thead>
          <tbody>
            {loading ? [1,2,3,4,5].map(i => (
              <tr key={i}><td colSpan={6}><div className="h-7 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>
            )) : filtered.map(l => (
              <tr key={l.id}>
                <td className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                <td>
                  <p className="font-medium text-sm">{l.user?.nama || 'System'}</p>
                  <p className="text-xs text-slate-400">{l.user?.role}</p>
                </td>
                <td>
                  <span className={cn('badge text-xs', MODUL_COLORS[l.modul] || 'badge-lunas')}>{l.modul}</span>
                </td>
                <td className="font-medium text-sm">{l.aksi}</td>
                <td className="text-xs text-slate-500 font-mono">{l.targetId || '—'}</td>
                <td className="text-xs text-slate-400 font-mono">{l.ipAddress || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <Shield size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">Tidak ada log ditemukan</p>
          </div>
        )}
      </div>

      {total > 50 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-slate-500">Hal {page} dari {Math.ceil(total/50)}</span>
          <button onClick={() => setPage(p=>p+1)} disabled={page>=Math.ceil(total/50)} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
