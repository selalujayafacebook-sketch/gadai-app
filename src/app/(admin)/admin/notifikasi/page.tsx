'use client'
// src/app/(admin)/admin/notifikasi/page.tsx
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Send, Bell, MessageCircle, Mail, Users, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIPE_OPTIONS = [
  { value: 'PROMO', label: '🎁 Promo' },
  { value: 'SISTEM', label: '⚙️ Sistem' },
  { value: 'REMINDER_PEMBAYARAN', label: '💳 Reminder Pembayaran' },
  { value: 'REMINDER_JATUH_TEMPO', label: '⚠️ Reminder Jatuh Tempo' },
]

const CHANNEL_OPTIONS = [
  { value: 'APP', icon: Bell, label: 'Notifikasi App' },
  { value: 'WHATSAPP', icon: MessageCircle, label: 'WhatsApp' },
  { value: 'EMAIL', icon: Mail, label: 'Email' },
  { value: 'ALL', icon: Users, label: 'Semua Channel' },
]

const TARGET_OPTIONS = [
  { value: 'ALL', label: 'Semua Nasabah' },
  { value: 'ROLE', label: 'Berdasarkan Role' },
]

export default function AdminNotifikasiPage() {
  const [form, setForm] = useState({
    judul: '', pesan: '', tipe: 'SISTEM', channel: 'APP', target: 'ALL', role: 'NASABAH',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ total: number; message: string } | null>(null)

  function handleChange(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSend() {
    if (!form.judul.trim() || !form.pesan.trim()) {
      toast.error('Judul dan pesan wajib diisi')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/notifikasi-blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      setResult({ total: json.data.total, message: json.data.message })
      toast.success(json.data.message)
      setForm(prev => ({ ...prev, judul: '', pesan: '' }))
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Blast Notifikasi</h1>
        <p className="page-subtitle">Kirim pesan massal ke nasabah via App, WhatsApp, atau Email</p>
      </div>

      <div className="space-y-5">
        {/* Channel */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Channel Pengiriman</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CHANNEL_OPTIONS.map(c => (
              <button key={c.value} onClick={() => handleChange('channel', c.value)}
                className={cn('flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                  form.channel === c.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-gray-700 hover:border-blue-300')}>
                <c.icon size={22} className={form.channel === c.value ? 'text-blue-600' : 'text-slate-400'} />
                <span className={cn('text-xs font-semibold text-center',
                  form.channel === c.value ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500')}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Target & Tipe */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Target & Kategori</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Target Penerima</label>
              <select value={form.target} onChange={e => handleChange('target', e.target.value)} className="input">
                {TARGET_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tipe Notifikasi</label>
              <select value={form.tipe} onChange={e => handleChange('tipe', e.target.value)} className="input">
                {TIPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          {form.target === 'ROLE' && (
            <div className="mt-4">
              <label className="label">Role</label>
              <select value={form.role} onChange={e => handleChange('role', e.target.value)} className="input">
                {['NASABAH','PETUGAS','SUPERVISOR','ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Konten */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Konten Pesan</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Judul <span className="text-red-500">*</span></label>
              <input type="text" value={form.judul} onChange={e => handleChange('judul', e.target.value)}
                placeholder="Contoh: Promo Spesial Akhir Tahun!" className="input" maxLength={100} />
              <p className="text-xs text-slate-400 mt-1">{form.judul.length}/100 karakter</p>
            </div>
            <div>
              <label className="label">Pesan <span className="text-red-500">*</span></label>
              <textarea value={form.pesan} onChange={e => handleChange('pesan', e.target.value)}
                rows={5} placeholder="Tulis isi pesan di sini..." className="input resize-none" maxLength={500} />
              <p className="text-xs text-slate-400 mt-1">{form.pesan.length}/500 karakter</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {(form.judul || form.pesan) && (
          <div className="card p-5 bg-slate-50 dark:bg-gray-800/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Preview Pesan</p>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-slate-200 dark:border-gray-700">
              <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{form.judul || '(judul)'}</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{form.pesan || '(pesan)'}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="alert-success flex items-center gap-3">
            <Bell size={18} className="text-emerald-600 flex-shrink-0" />
            <p><strong>{result.message}</strong></p>
          </div>
        )}

        <button onClick={handleSend} disabled={loading || !form.judul || !form.pesan}
          className="btn-primary w-full btn-lg gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? 'Mengirim...' : 'Kirim Sekarang'}
        </button>
      </div>
    </div>
  )
}
