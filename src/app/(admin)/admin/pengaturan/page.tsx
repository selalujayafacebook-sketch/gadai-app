'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Settings, Save, Loader2, Tag, Percent, Calendar, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Setting { kunci: string; nilai: string; deskripsi?: string }

const SETTING_META: Record<string,{label:string; icon:any; type:string; min?:number; max?:number; step?:number; suffix?:string}> = {
  BUNGA_DEFAULT: { label:'Bunga Default (%/bulan)', icon:Percent, type:'number', min:0.5, max:10, step:0.5, suffix:'%' },
  TENOR_DEFAULT: { label:'Tenor Default (hari)', icon:Calendar, type:'number', min:7, max:120, step:1, suffix:'hari' },
  TENOR_MAKS: { label:'Tenor Maksimal (hari)', icon:Calendar, type:'number', min:30, max:365, step:1, suffix:'hari' },
  PERSEN_PINJAMAN: { label:'Persen Pinjaman dari Taksiran (%)', icon:Percent, type:'number', min:50, max:90, step:5, suffix:'%' },
  DENDA_HARIAN: { label:'Denda Harian Keterlambatan (%)', icon:AlertTriangle, type:'number', min:0.05, max:1, step:0.05, suffix:'%' },
  BIAYA_ADMIN: { label:'Biaya Admin per Transaksi (Rp)', icon:Tag, type:'number', min:0, max:100000, step:1000, suffix:'Rp' },
  NAMA_PERUSAHAAN: { label:'Nama Perusahaan', icon:Tag, type:'text' },
  TELEPON_CS: { label:'Telepon Customer Service', icon:Tag, type:'text' },
  EMAIL_CS: { label:'Email Customer Service', icon:Tag, type:'text' },
  ALAMAT: { label:'Alamat Perusahaan', icon:Tag, type:'text' },
  INVOICE_PREFIX: { label:'Prefix Nomor Invoice', icon:Tag, type:'text' },
  INVOICE_FOOTER: { label:'Footer Invoice', icon:Tag, type:'text' },
}

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changed, setChanged] = useState<Record<string,string>>({})

  useEffect(() => {
    fetch('/api/admin/pengaturan').then(r=>r.json())
      .then(j=>{ setSettings(j.data?.settings||[]); setLoading(false) }).catch(()=>setLoading(false))
  },[])

  function getValue(kunci: string) { return changed[kunci] ?? settings.find(s=>s.kunci===kunci)?.nilai ?? '' }
  function handleChange(kunci: string, nilai: string) { setChanged(prev=>({...prev,[kunci]:nilai})) }

  async function handleSave() {
    if (Object.keys(changed).length===0) { toast('Tidak ada perubahan'); return }
    setSaving(true)
    try {
      const updates = Object.entries(changed).map(([kunci,nilai])=>({kunci,nilai}))
      const res = await fetch('/api/admin/pengaturan',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(updates)})
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      setSettings(prev=>prev.map(s=>({...s,nilai:changed[s.kunci]??s.nilai})))
      setChanged({})
      toast.success('Pengaturan berhasil disimpan')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSaving(false) }
  }

  const hasChanges = Object.keys(changed).length>0

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="page-title">Pengaturan Sistem</h1><p className="page-subtitle">Konfigurasi bunga, tenor, dan parameter platform</p></div>
        <button onClick={handleSave} disabled={saving||!hasChanges} className="btn-primary gap-2">
          {saving?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>}{saving?'Menyimpan...':'Simpan'}
          {hasChanges&&!saving&&<span className="w-2 h-2 bg-amber-400 rounded-full"/>}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3,4,5].map(i=><div key={i} className="h-20 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div>
      ) : (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="section-title mb-4 flex items-center gap-2"><Percent size={16} className="text-blue-600"/>Parameter Keuangan</h2>
            <div className="space-y-4">
              {['BUNGA_DEFAULT','TENOR_DEFAULT','TENOR_MAKS','PERSEN_PINJAMAN','DENDA_HARIAN','BIAYA_ADMIN'].map(kunci=>{
                const meta = SETTING_META[kunci]
                const val = getValue(kunci)
                const isChanged = changed[kunci]!==undefined
                return (
                  <div key={kunci}>
                    <label className={cn('label',isChanged&&'text-blue-600')}>{meta.label} {isChanged&&<span className="text-xs text-amber-500">● diubah</span>}</label>
                    <div className="flex gap-3 items-center">
                      <input type={meta.type} min={meta.min} max={meta.max} step={meta.step} value={val}
                        onChange={e=>handleChange(kunci,e.target.value)}
                        className={cn('input flex-1',isChanged&&'border-blue-400 focus:ring-blue-500')}/>
                      {meta.suffix&&<span className="text-slate-400 text-sm w-12 flex-shrink-0">{meta.suffix}</span>}
                    </div>
                    {meta.type==='number'&&meta.max&&(
                      <input type="range" min={meta.min} max={meta.max} step={meta.step} value={val}
                        onChange={e=>handleChange(kunci,e.target.value)} className="w-full accent-blue-600 mt-2"/>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4 flex items-center gap-2"><Settings size={16} className="text-blue-600"/>Informasi Perusahaan</h2>
            <div className="space-y-4">
              {['NAMA_PERUSAHAAN','ALAMAT','TELEPON_CS','EMAIL_CS'].map(kunci=>{
                const meta = SETTING_META[kunci]
                const val = getValue(kunci)
                const isChanged = changed[kunci]!==undefined
                return (
                  <div key={kunci}>
                    <label className={cn('label',isChanged&&'text-blue-600')}>{meta.label}</label>
                    <input type="text" value={val} onChange={e=>handleChange(kunci,e.target.value)} className={cn('input',isChanged&&'border-blue-400')}/>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4 flex items-center gap-2"><Tag size={16} className="text-blue-600"/>Konfigurasi Invoice</h2>
            <div className="space-y-4">
              {['INVOICE_PREFIX','INVOICE_FOOTER'].map(kunci=>{
                const meta = SETTING_META[kunci]
                const val = getValue(kunci)
                const isChanged = changed[kunci]!==undefined
                return (
                  <div key={kunci}>
                    <label className={cn('label',isChanged&&'text-blue-600')}>{meta.label}</label>
                    <input type="text" value={val} onChange={e=>handleChange(kunci,e.target.value)} className={cn('input',isChanged&&'border-blue-400')}/>
                  </div>
                )
              })}
            </div>
          </div>

          {hasChanges&&(
            <div className="alert-warn flex items-center gap-2">
              <AlertTriangle size={16} className="flex-shrink-0"/>
              <span>Ada {Object.keys(changed).length} perubahan belum disimpan. Klik "Simpan" untuk menerapkan.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
