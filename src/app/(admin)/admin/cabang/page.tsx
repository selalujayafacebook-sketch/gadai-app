'use client'
// src/app/(admin)/admin/cabang/page.tsx
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, Plus, Pencil, CheckCircle2, XCircle, Loader2, MapPin, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CabangPage() {
  const [cabang, setCabang] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nama: '', kode: '', alamat: '', kota: '', telepon: '', email: '' })

  useEffect(() => { loadData() }, [])

  function loadData() {
    fetch('/api/admin/cabang').then(r => r.json()).then(j => { setCabang(j.data?.cabang || []); setLoading(false) })
  }

  function openAdd() { setForm({ nama:'', kode:'', alamat:'', kota:'', telepon:'', email:'' }); setEditing(null); setModal(true) }
  function openEdit(c: any) { setForm({ nama:c.nama, kode:c.kode, alamat:c.alamat||'', kota:c.kota||'', telepon:c.telepon||'', email:c.email||'' }); setEditing(c); setModal(true) }

  async function handleSave() {
    setSaving(true)
    try {
      const method = editing ? 'PATCH' : 'POST'
      const body = editing ? { ...form, id: editing.id } : form
      const res = await fetch('/api/admin/cabang', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success(editing ? 'Cabang diperbarui' : 'Cabang ditambahkan')
      setModal(false)
      loadData()
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSaving(false) }
  }

  async function toggleAktif(c: any) {
    await fetch('/api/admin/cabang', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, isActive: !c.isActive }) })
    loadData()
    toast.success(`Cabang ${!c.isActive ? 'diaktifkan' : 'dinonaktifkan'}`)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="page-title">Manajemen Cabang</h1><p className="page-subtitle">{cabang.length} cabang terdaftar</p></div>
        <button onClick={openAdd} className="btn-primary gap-2"><Plus size={16} /> Tambah Cabang</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cabang.map(c => (
            <div key={c.id} className={cn('card p-5', !c.isActive && 'opacity-60')}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{c.nama}</p>
                    <p className="text-xs text-slate-400 font-mono">{c.kode}</p>
                  </div>
                </div>
                <span className={cn('badge text-xs', c.isActive ? 'badge-aktif' : 'badge-ditolak')}>{c.isActive ? 'Aktif' : 'Nonaktif'}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                {c.kota && <div className="flex items-center gap-1.5"><MapPin size={12} />{c.kota}</div>}
                {c.telepon && <div className="flex items-center gap-1.5"><Phone size={12} />{c.telepon}</div>}
                {c.alamat && <p className="text-slate-400 truncate">{c.alamat}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
                <div><p className="text-xs text-slate-400">Nasabah</p><p className="font-bold text-slate-900 dark:text-white">{c._count?.users || 0}</p></div>
                <div><p className="text-xs text-slate-400">Gadai</p><p className="font-bold text-slate-900 dark:text-white">{c._count?.gadai || 0}</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-outline flex-1 text-xs gap-1 py-2"><Pencil size={12} />Edit</button>
                <button onClick={() => toggleAktif(c)} className={cn('flex-1 text-xs gap-1 py-2', c.isActive ? 'btn-danger' : 'btn-success')}>
                  {c.isActive ? <><XCircle size={12} />Nonaktif</> : <><CheckCircle2 size={12} />Aktifkan</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative card p-6 w-full max-w-md animate-slide-up">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-5">{editing ? 'Edit Cabang' : 'Tambah Cabang'}</h3>
            <div className="space-y-3">
              {[
                { key: 'nama', label: 'Nama Cabang', placeholder: 'Cabang Jakarta Pusat' },
                { key: 'kode', label: 'Kode Unik', placeholder: 'JKT01', disabled: !!editing },
                { key: 'kota', label: 'Kota', placeholder: 'Jakarta' },
                { key: 'alamat', label: 'Alamat', placeholder: 'Jl. Sudirman No.1' },
                { key: 'telepon', label: 'Telepon', placeholder: '021-12345678' },
                { key: 'email', label: 'Email', placeholder: 'cabang@gadaiku.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type="text" value={(form as any)[f.key]} disabled={f.disabled}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={cn('input', f.disabled && 'opacity-60 cursor-not-allowed')} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
