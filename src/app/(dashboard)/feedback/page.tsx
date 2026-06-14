'use client'
// src/app/(dashboard)/feedback/page.tsx
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Star, Send, Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/utils'

export default function FeedbackPage() {
  const [gadais, setGadais] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ gadaiId: '', rating: 0, kategori: 'PELAYANAN', pesan: '' })
  const [hovered, setHovered] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/gadai/baru?status=DITEBUS&limit=20').then(r => r.json()),
      fetch('/api/feedback').then(r => r.json()),
    ]).then(([g, f]) => {
      setGadais(g.data?.gadai || [])
      setFeedbacks(f.data?.feedbacks || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSubmit() {
    if (!form.rating) { toast.error('Pilih rating bintang'); return }
    if (!form.pesan.trim()) { toast.error('Tulis pesan feedback'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Terima kasih atas feedback Anda! ⭐')
      setForm({ gadaiId: '', rating: 0, kategori: 'PELAYANAN', pesan: '' })
      setFeedbacks(prev => [json.data.feedback, ...prev])
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const KATEGORI = ['PELAYANAN', 'PROSES_GADAI', 'PEMBAYARAN', 'APLIKASI', 'LAINNYA']

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Rating & Feedback</h1>
        <p className="page-subtitle">Bantu kami meningkatkan layanan dengan feedback Anda</p>
      </div>

      {/* Form feedback */}
      <div className="card p-6 mb-6">
        <h2 className="section-title mb-5 flex items-center gap-2">
          <Star size={18} className="text-amber-500" /> Beri Penilaian
        </h2>

        {/* Star rating */}
        <div className="mb-5">
          <label className="label">Rating Keseluruhan</label>
          <div className="flex gap-2 mt-2">
            {[1,2,3,4,5].map(s => (
              <button key={s}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setForm(p => ({...p, rating: s}))}
                className="transition-transform hover:scale-110">
                <Star size={36}
                  className={cn('transition-colors',
                    s <= (hovered || form.rating) ? 'text-amber-400 fill-current' : 'text-slate-300 dark:text-slate-600')} />
              </button>
            ))}
          </div>
          {form.rating > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-2">
              {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][form.rating]} ⭐
            </p>
          )}
        </div>

        {/* Gadai referensi */}
        {gadais.length > 0 && (
          <div className="mb-4">
            <label className="label">Terkait Gadai (opsional)</label>
            <select value={form.gadaiId} onChange={e => setForm(p => ({...p, gadaiId: e.target.value}))} className="input">
              <option value="">— Tidak terkait gadai tertentu —</option>
              {gadais.map(g => <option key={g.id} value={g.id}>#{g.nomorGadai} - {g.barang?.nama}</option>)}
            </select>
          </div>
        )}

        {/* Kategori */}
        <div className="mb-4">
          <label className="label">Kategori Feedback</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {KATEGORI.map(k => (
              <button key={k} onClick={() => setForm(p => ({...p, kategori: k}))}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all',
                  form.kategori === k ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700' : 'border-slate-200 dark:border-gray-700 text-slate-500')}>
                {k.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Pesan */}
        <div className="mb-5">
          <label className="label">Pesan <span className="text-red-500">*</span></label>
          <textarea value={form.pesan} onChange={e => setForm(p => ({...p, pesan: e.target.value}))}
            rows={4} placeholder="Ceritakan pengalaman Anda menggunakan GadaiKu..."
            className="input resize-none" maxLength={500} />
          <p className="text-xs text-slate-400 mt-1">{form.pesan.length}/500</p>
        </div>

        <button onClick={handleSubmit} disabled={submitting || !form.rating} className="btn-primary w-full btn-lg gap-2">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {submitting ? 'Mengirim...' : 'Kirim Feedback'}
        </button>
      </div>

      {/* Riwayat feedback */}
      {feedbacks.length > 0 && (
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-600" /> Feedback Anda Sebelumnya
          </h2>
          <div className="space-y-3">
            {feedbacks.map(f => (
              <div key={f.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className={cn(s <= f.rating ? 'text-amber-400 fill-current' : 'text-slate-300')} />
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="badge badge-diproses text-xs">{f.kategori?.replace('_', ' ')}</span>
                    <p className="text-xs text-slate-400 mt-1">{formatRelative(f.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{f.pesan}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
