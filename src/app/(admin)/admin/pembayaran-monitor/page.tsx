'use client'
// src/app/(admin)/admin/pembayaran-monitor/page.tsx
import { useEffect, useState } from 'react'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Search, CreditCard, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { useDebounce } from '@/hooks'
import toast from 'react-hot-toast'

const STATUS_TABS = ['Semua', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED']

export default function AdminPembayaranMonitorPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Semua')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const dSearch = useDebounce(search)

  useEffect(() => { loadData() }, [tab, page])

  async function loadData() {
    setLoading(true)
    const q = new URLSearchParams({ page: String(page), limit: '20' })
    if (tab !== 'Semua') q.set('status', tab)
    fetch(`/api/admin/pembayaran?${q}`)
      .then(r => r.json())
      .then(j => {
        setPayments(j.data?.payments || [])
        setTotal(j.data?.pagination?.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  async function verifikasiManual(id: string) {
    try {
      const res = await fetch(`/api/admin/pembayaran/${id}/verifikasi`, { method: 'PATCH' })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Pembayaran diverifikasi manual')
      loadData()
    } catch { toast.error('Terjadi kesalahan') }
  }

  const filtered = payments.filter(p =>
    !dSearch ||
    p.nomorPembayaran?.toLowerCase().includes(dSearch.toLowerCase()) ||
    p.gadai?.nomorGadai?.toLowerCase().includes(dSearch.toLowerCase()) ||
    p.user?.nama?.toLowerCase().includes(dSearch.toLowerCase())
  )

  const statusIcon: Record<string, React.ReactNode> = {
    SUCCESS: <CheckCircle2 size={15} className="text-emerald-500" />,
    FAILED: <XCircle size={15} className="text-red-500" />,
    PENDING: <Clock size={15} className="text-amber-500" />,
    EXPIRED: <XCircle size={15} className="text-slate-400" />,
  }

  const statusBadge: Record<string, string> = {
    SUCCESS: 'badge-aktif',
    FAILED: 'badge-ditolak',
    PENDING: 'badge-menunggu',
    EXPIRED: 'badge-lunas',
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Monitor Pembayaran</h1>
          <p className="page-subtitle">{total} total transaksi pembayaran</p>
        </div>
        <button onClick={loadData} className="btn-secondary gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Cari nomor pembayaran, gadai, atau nama nasabah..."
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-thin">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1) }}
            className={cn('px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all',
              tab === t ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-slate-500 border border-slate-200 dark:border-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>No. Pembayaran</th>
              <th>Nasabah</th>
              <th>Jenis</th>
              <th>Metode</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Waktu</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2,3,4,5].map(i => (
              <tr key={i}><td colSpan={8}><div className="h-8 bg-slate-100 dark:bg-gray-800 rounded animate-pulse" /></td></tr>
            )) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <p className="font-mono text-xs font-semibold text-blue-600">{p.nomorPembayaran}</p>
                  <p className="text-xs text-slate-400 mt-0.5">#{p.gadai?.nomorGadai}</p>
                </td>
                <td>
                  <p className="font-medium text-sm">{p.user?.nama}</p>
                  <p className="text-xs text-slate-400">{p.user?.noHp}</p>
                </td>
                <td><span className="badge badge-diproses text-xs">{p.jenis}</span></td>
                <td className="text-xs text-slate-500">{p.metodePembayaran || '—'}</td>
                <td className="font-semibold text-sm">{formatRupiah(p.totalBayar || p.jumlah)}</td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {statusIcon[p.status]}
                    <span className={cn('badge text-xs', statusBadge[p.status] || 'badge-lunas')}>{p.status}</span>
                  </div>
                </td>
                <td className="text-xs text-slate-400 whitespace-nowrap">
                  {p.paidAt ? formatDateTime(p.paidAt) : formatDateTime(p.createdAt)}
                </td>
                <td>
                  {p.status === 'PENDING' && (
                    <button onClick={() => verifikasiManual(p.id)}
                      className="btn-success text-xs py-1.5 px-3 gap-1">
                      <CheckCircle2 size={12} /> Verif Manual
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <CreditCard size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">Tidak ada data pembayaran</p>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-slate-500">Hal {page} dari {Math.ceil(total/20)}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/20)}
            className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
