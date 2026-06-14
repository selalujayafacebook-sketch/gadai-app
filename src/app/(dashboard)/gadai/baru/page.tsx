'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, ChevronRight, CheckCircle2, Calculator } from 'lucide-react'
import { formatRupiah, hitungBunga } from '@/lib/utils'
import { cn } from '@/lib/utils'

const KONDISI = ['BARU','SANGAT_BAIK','BAIK','CUKUP']
const KONDISI_LABEL: Record<string,string> = {BARU:'Baru',SANGAT_BAIK:'Sangat Baik',BAIK:'Baik',CUKUP:'Cukup'}

export default function AjukanGadaiPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [kategoriList, setKategoriList] = useState<any[]>([])
  const [form, setForm] = useState({
    kategoriId:'', namaBarang:'', merk:'', model:'', tahun:'', kondisi:'BAIK',
    deskripsi:'', nilaiTaksiran:'', tenor:30, catatan:''
  })

  useEffect(() => {
    fetch('/api/admin/kategori').then(r=>r.json())
      .then(j=>setKategoriList(j.data?.kategori||[]))
      .catch(()=>setKategoriList([
        {id:'1',nama:'Elektronik'},{id:'2',nama:'Perhiasan'},
        {id:'3',nama:'Kendaraan'},{id:'4',nama:'Fashion Mewah'},{id:'5',nama:'Lainnya'}
      ]))
  },[])

  const nilai = parseFloat(form.nilaiTaksiran)||0
  const pinjaman = Math.round(nilai*0.75)
  const {totalBunga,totalBayar} = hitungBunga({jumlahPinjaman:pinjaman,bungaPerBulan:1.5,tenor:form.tenor})

  function set(k: string, v: any) { setForm(p=>({...p,[k]:v})) }

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch('/api/gadai/baru', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...form, nilaiTaksiran:nilai, tahun:form.tahun?parseInt(form.tahun):undefined})
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Pengajuan gadai berhasil dikirim!')
      router.push('/gadai')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  const steps = ['Info Barang','Estimasi','Konfirmasi']

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6"><h1 className="page-title">Ajukan Gadai Baru</h1><p className="page-subtitle">Isi form berikut untuk mengajukan gadai</p></div>
      
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s,i)=>(
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
              step>i+1?'bg-emerald-500 text-white':step===i+1?'bg-blue-600 text-white':'bg-slate-100 dark:bg-gray-800 text-slate-400')}>
              {step>i+1?<CheckCircle2 size={16}/>:i+1}
            </div>
            <span className={cn('text-xs font-medium hidden sm:block',step===i+1?'text-slate-900 dark:text-white':'text-slate-400')}>{s}</span>
            {i<2&&<div className={cn('flex-1 h-0.5',step>i+1?'bg-emerald-400':'bg-slate-200 dark:bg-gray-700')}/>}
          </div>
        ))}
      </div>

      {step===1&&(
        <div className="card p-6 space-y-5 animate-fade-in">
          <h2 className="section-title">Informasi Barang</h2>
          <div>
            <label className="label">Kategori Barang <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {kategoriList.map(k=>(
                <button key={k.id} type="button" onClick={()=>set('kategoriId',k.id)}
                  className={cn('p-3 rounded-xl border-2 text-sm font-medium transition-all text-center',
                    form.kategoriId===k.id?'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700':'border-slate-200 dark:border-gray-700 text-slate-600 hover:border-blue-300')}>
                  {k.nama}
                </button>
              ))}
            </div>
          </div>
          <div><label className="label">Nama Barang <span className="text-red-500">*</span></label>
            <input value={form.namaBarang} onChange={e=>set('namaBarang',e.target.value)} className="input" placeholder="Contoh: iPhone 14 Pro Max 256GB"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Merk</label><input value={form.merk} onChange={e=>set('merk',e.target.value)} className="input" placeholder="Apple, Samsung..."/></div>
            <div><label className="label">Model/Tipe</label><input value={form.model} onChange={e=>set('model',e.target.value)} className="input" placeholder="Pro Max, Ultra..."/></div>
          </div>
          <div>
            <label className="label">Kondisi <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {KONDISI.map(k=>(
                <button key={k} type="button" onClick={()=>set('kondisi',k)}
                  className={cn('py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                    form.kondisi===k?'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700':'border-slate-200 dark:border-gray-700 text-slate-600 hover:border-blue-300')}>
                  {KONDISI_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
          <div><label className="label">Deskripsi</label>
            <textarea value={form.deskripsi} onChange={e=>set('deskripsi',e.target.value)} rows={3}
              className="input resize-none" placeholder="Kelengkapan aksesori, kondisi detail..."/></div>
          <button onClick={()=>{if(!form.kategoriId||!form.namaBarang){toast.error('Lengkapi data barang');return}setStep(2)}}
            className="btn-primary w-full btn-lg gap-2">Lanjut <ChevronRight size={18}/></button>
        </div>
      )}

      {step===2&&(
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6 space-y-5">
            <h2 className="section-title">Estimasi & Tenor</h2>
            <div><label className="label">Estimasi Nilai Barang (Rp) <span className="text-red-500">*</span></label>
              <input type="number" value={form.nilaiTaksiran} onChange={e=>set('nilaiTaksiran',e.target.value)}
                className="input" placeholder="Contoh: 5000000"/>
              <p className="text-xs text-slate-400 mt-1">Nilai taksiran final ditentukan petugas setelah verifikasi</p></div>
            <div>
              <label className="label">Tenor Gadai: <strong>{form.tenor} hari</strong></label>
              <input type="range" min="7" max="120" value={form.tenor} onChange={e=>set('tenor',parseInt(e.target.value))} className="w-full accent-blue-600"/>
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>7 hari</span><span>120 hari</span></div>
            </div>
            <div><label className="label">Catatan Tambahan</label>
              <textarea value={form.catatan} onChange={e=>set('catatan',e.target.value)} rows={2} className="input resize-none" placeholder="Catatan untuk petugas (opsional)"/></div>
          </div>
          {nilai>0&&(
            <div className="card p-5 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-4"><Calculator size={16} className="text-blue-600"/><p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">Estimasi Pinjaman</p></div>
              <div className="space-y-2 text-sm">
                {[['Nilai taksiran Anda',formatRupiah(nilai)],['Dana diterima (75%)',formatRupiah(pinjaman)],['Bunga '+form.tenor+' hari (1.5%/bln)',formatRupiah(totalBunga)],['Total pelunasan',formatRupiah(totalBayar)]].map(([k,v],i)=>(
                  <div key={k} className={cn('flex justify-between',i===3&&'pt-2 border-t border-blue-200 dark:border-blue-700 font-semibold')}>
                    <span className="text-slate-600 dark:text-slate-400">{k}</span>
                    <span className={i===3?'text-blue-700 dark:text-blue-400':'font-medium'}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={()=>setStep(1)} className="btn-outline flex-1 btn-lg">← Kembali</button>
            <button onClick={()=>{if(!nilai){toast.error('Masukkan estimasi nilai barang');return}setStep(3)}} className="btn-primary flex-1 btn-lg gap-2">Lanjut <ChevronRight size={18}/></button>
          </div>
        </div>
      )}

      {step===3&&(
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6">
            <h2 className="section-title mb-4">Konfirmasi Pengajuan</h2>
            <div className="space-y-3 text-sm">
              {[['Nama Barang',form.namaBarang],['Kategori',kategoriList.find(k=>k.id===form.kategoriId)?.nama||'—'],['Kondisi',KONDISI_LABEL[form.kondisi]||'—'],['Estimasi Nilai',formatRupiah(nilai)],['Dana Diterima (est.)',formatRupiah(pinjaman)],['Tenor',`${form.tenor} hari`],['Total Pelunasan (est.)',formatRupiah(totalBayar)]].map(([k,v])=>(
                <div key={k} className="flex justify-between py-2 border-b border-slate-100 dark:border-gray-800 last:border-0">
                  <span className="text-slate-500">{k}</span><span className="font-semibold text-slate-900 dark:text-white text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="alert-info text-xs">⚠️ Nilai pinjaman dan bunga final ditentukan petugas setelah verifikasi fisik barang.</div>
          <div className="flex gap-3">
            <button onClick={()=>setStep(2)} className="btn-outline flex-1 btn-lg">← Kembali</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 btn-lg">
              {loading&&<Loader2 size={18} className="animate-spin"/>}
              {loading?'Mengirim...':'Kirim Pengajuan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
