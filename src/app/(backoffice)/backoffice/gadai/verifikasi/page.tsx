'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { CheckCircle2, XCircle, Loader2, Package } from 'lucide-react'
import Link from 'next/link'

export default function BackofficeVerifikasiGadaiPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string|null>(null)
  const [modal, setModal] = useState<any>(null)
  const [catatan, setCatatan] = useState('')
  const [jumlahOverride, setJumlahOverride] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gadai?status=MENUNGGU_VERIFIKASI')
      const json = await res.json()
      setList(json.data?.gadai || [])
    } catch {
      toast.error('Gagal memuat data verifikasi')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setProcessing(id)
    try {
      const res = await fetch(`/api/gadai/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatanPetugas: catatan, jumlahPinjaman: jumlahOverride ? parseFloat(jumlahOverride) : undefined }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success(status === 'DISETUJUI' ? 'Pengajuan disetujui' : 'Pengajuan ditolak')
      setList(prev => prev.filter(item => item.id !== id))
      setModal(null)
      setCatatan('')
      setJumlahOverride('')
    } catch {
      toast.error('Terjadi kesalahan saat memproses')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Verifikasi Gadai</h1>
        <p className="page-subtitle">Kelola pengajuan gadai yang menunggu persetujuan</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Semua pengajuan telah diproses</p>
          <p className="text-sm text-slate-400">Tidak ada pengajuan baru saat ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(item => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.barang?.nama || '—'}</p>
                    <p className="text-xs text-slate-400">#{item.nomorGadai} · {item.user?.nama} · {item.user?.noHp}</p>
                    <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
                <span className="badge badge-menunggu">Menunggu</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs mb-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl p-3">
                <div>
                  <p className="text-slate-400">Nilai Taksiran</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatRupiah(item.nilaiTaksiran)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Dana Diajukan</p>
                  <p className="font-bold text-blue-600 mt-0.5">{formatRupiah(item.jumlahPinjaman)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Tenor</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.tenor} hari</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/backoffice/gadai/${item.id}`} className="btn-outline flex-1 justify-center gap-1.5 text-xs py-2">
                  Detail
                </Link>
                <button onClick={() => setModal({ ...item, action: 'TOLAK' })} className="btn-danger flex-1 justify-center gap-1.5 text-xs py-2">
                  Tolak
                </button>
                <button onClick={() => setModal({ ...item, action: 'SETUJUI' })} className="btn-success flex-1 justify-center gap-1.5 text-xs py-2">
                  Setujui
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative card p-6 w-full max-w-md animate-slide-up">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              {modal.action === 'SETUJUI' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
            </h3>
            <p className="text-sm text-slate-500 mb-5">{modal.barang?.nama} — {modal.user?.nama}</p>
            {modal.action === 'SETUJUI' && (
              <div className="mb-4">
                <label className="label">Jumlah Pinjaman Disetujui (Rp)</label>
                <input type="number" value={jumlahOverride} onChange={e => setJumlahOverride(e.target.value)} placeholder={`Default: ${modal.jumlahPinjaman}`} className="input" />
                <p className="text-xs text-slate-400 mt-1">Kosongkan untuk gunakan nilai pengajuan nasabah</p>
              </div>
            )}
            <div className="mb-5">
              <label className="label">Catatan untuk Nasabah</label>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3} placeholder={modal.action === 'SETUJUI' ? 'Catatan persetujuan (opsional)' : 'Alasan penolakan (opsional)'} className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setCatatan(''); setJumlahOverride('') }} className="btn-secondary flex-1">Batal</button>
              <button onClick={() => updateStatus(modal.id, modal.action === 'SETUJUI' ? 'DISETUJUI' : 'DITOLAK')} disabled={!!processing} className={cn('flex-1', modal.action === 'SETUJUI' ? 'btn-success' : 'btn-danger')}>
                {processing === modal.id && <Loader2 size={16} className="animate-spin" />}
                {modal.action === 'SETUJUI' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
