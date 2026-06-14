'use client'
// src/app/(admin)/admin/promo/page.tsx
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Tag, Plus, Loader2, CheckCircle2, X } from 'lucide-react'
import { formatDate, formatRupiah } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TIPE_OPTIONS = [
  { value: 'POTONGAN_BUNGA', label: 'Potongan Bunga (%)' },
  { value: 'CASHBACK', label: 'Cashback (Rp)' },
  { value: 'BIAYA_ADMIN_GRATIS', label: 'Biaya Admin Gratis' },
]

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nama: '', kode: '', deskripsi: '', tipe: 'POTONGAN_BUNGA',
    nilai: '', minPinjaman: '', maxPenggunaan: '',
    berlakuDari: '', berlakuHingga: '',
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    fetch('/api/admin/promo')
      .then(r => r.json())
      .then(j => { setPromos(j.data?.promo || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function handleSave() {
    if (!form.nama || !form.kode || !form.nilai || !form.berlakuDari || !form.berlakuHingga) {
      toast.error('Lengkapi semua field yang wajib'); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          nilai: parseFloat(form.nilai),
          minPinjaman: form.minPinjaman ? parseFloat(form.minPinjaman) : null,
          maxPenggunaan: form.maxPenggunaan ? parseInt(form.maxPenggunaan) : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Promo berhasil dibuat')
      setModal(false)
      loadData()
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSaving(false) }
  }

  async function togglePromo(id: string, isActive: boolean) {
    await fetch('/api/admin/promo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    })
    loadData()
    toast.success(`Promo ${isActive ? 'dinonaktifkan' : 'diaktifkan'}`)
  }

  const now = new Date()

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Promo & Voucher</h1>
          <p className="page-subtitle">Kelola kode promo dan diskon untuk nasabah</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary gap-2"><Plus size={16} />Buat Promo</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
      ) : promos.length === 0 ? (
        <div className="card p-16 text-center">
          <Tag size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Belum ada promo</p>
          <p className="text-sm text-slate-400 mb-5">Buat promo pertama untuk menarik nasabah baru</p>
          <button onClick={() => setModal(true)} className="btn-primary inline-flex gap-2"><Plus size={16} />Buat Promo</button>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map(p => {
            const isExpired = new Date(p.berlakuHingga) < now
            const isUsedUp = p.maxPenggunaan && p.totalDigunakan >= p.maxPenggunaan
            return (
              <div key={p.id} className={cn('card p-5', !p.isActive && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Tag size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white">{p.nama}</p>
                        <code className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg font-bold tracking-widest">{p.kode}</code>
                        {isExpired && <span className="badge badge-ditolak">Kedaluwarsa</span>}
                        {isUsedUp && <span className="badge badge-jatuh">Habis</span>}
                        {p.isActive && !isExpired && !isUsedUp && <span className="badge badge-aktif">Aktif</span>}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{p.deskripsi}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        <span>💰 Nilai: <strong className="text-slate-700 dark:text-slate-300">{p.nilai}{p.tipe === 'POTONGAN_BUNGA' ? '%' : ' Rp'}</strong></span>
                        {p.minPinjaman && <span>Min: <strong>{formatRupiah(p.minPinjaman)}</strong></span>}
                        <span>Digunakan: <strong>{p.totalDigunakan}/{p.maxPenggunaan || '∞'}</strong></span>
                        <span>Berlaku: <strong>{formatDate(p.berlakuDari)} – {formatDate(p.berlakuHingga)}</strong></span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => togglePromo(p.id, p.isActive)}
                    className={cn('p-2 rounded-xl flex-shrink-0', p.isActive ? 'btn-danger' : 'btn-success')}>
                    {p.isActive ? <X size={16} /> : <CheckCircle2 size={16} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal tambah promo */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative card p-6 w-full max-w-lg animate-slide-up overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-5">Buat Promo Baru</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nama Promo *</label>
                  <input value={form.nama} onChange={e => setForm(p => ({...p, nama: e.target.value}))} className="input" placeholder="Promo Lebaran" />
                </div>
                <div>
                  <label className="label">Kode Promo *</label>
                  <input value={form.kode} onChange={e => setForm(p => ({...p, kode: e.target.value.toUpperCase()}))} className="input" placeholder="LEBARAN25" />
                </div>
              </div>
              <div>
                <label className="label">Deskripsi</label>
                <input value={form.deskripsi} onChange={e => setForm(p => ({...p, deskripsi: e.target.value}))} className="input" placeholder="Diskon bunga 10% untuk nasabah baru" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipe Promo *</label>
                  <select value={form.tipe} onChange={e => setForm(p => ({...p, tipe: e.target.value}))} className="input">
                    {TIPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Nilai Promo *</label>
                  <input type="number" value={form.nilai} onChange={e => setForm(p => ({...p, nilai: e.target.value}))} className="input" placeholder={form.tipe === 'POTONGAN_BUNGA' ? '10' : '50000'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Min. Pinjaman (Rp)</label>
                  <input type="number" value={form.minPinjaman} onChange={e => setForm(p => ({...p, minPinjaman: e.target.value}))} className="input" placeholder="500000" />
                </div>
                <div>
                  <label className="label">Maks. Penggunaan</label>
                  <input type="number" value={form.maxPenggunaan} onChange={e => setForm(p => ({...p, maxPenggunaan: e.target.value}))} className="input" placeholder="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Berlaku Dari *</label>
                  <input type="date" value={form.berlakuDari} onChange={e => setForm(p => ({...p, berlakuDari: e.target.value}))} className="input" />
                </div>
                <div>
                  <label className="label">Berlaku Hingga *</label>
                  <input type="date" value={form.berlakuHingga} onChange={e => setForm(p => ({...p, berlakuHingga: e.target.value}))} className="input" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'Menyimpan...' : 'Buat Promo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
