'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, CreditCard, Building2, Wallet, QrCode, CheckCircle2, Shield } from 'lucide-react'
import { formatRupiah, hitungBunga } from '@/lib/utils'
import { cn } from '@/lib/utils'

const METODE = [
  {id:'MIDTRANS_CARD',icon:CreditCard,label:'Kartu Kredit/Debit',desc:'Visa, Mastercard, JCB',color:'text-blue-600',bg:'bg-blue-50 dark:bg-blue-900/20'},
  {id:'MIDTRANS_VA',icon:Building2,label:'Virtual Account',desc:'BCA, Mandiri, BNI, BRI',color:'text-green-600',bg:'bg-green-50 dark:bg-green-900/20'},
  {id:'MIDTRANS_QRIS',icon:QrCode,label:'QRIS',desc:'Scan QR dari aplikasi manapun',color:'text-purple-600',bg:'bg-purple-50 dark:bg-purple-900/20'},
  {id:'MIDTRANS_WALLET',icon:Wallet,label:'E-Wallet',desc:'GoPay, OVO, DANA, ShopeePay',color:'text-orange-600',bg:'bg-orange-50 dark:bg-orange-900/20'},
]

export default function PembayaranClient(){
  const params = useSearchParams()
  const router = useRouter()
  const gadaiId = params.get('gadaiId')||''
  const jenis = params.get('jenis')||'PELUNASAN'
  const [gadai, setGadai] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [metode, setMetode] = useState('MIDTRANS_VA')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tenorBaru, setTenorBaru] = useState(30)
  const [kodePromo, setKodePromo] = useState('')

  useEffect(() => {
    if (!gadaiId) return
    fetch(`/api/gadai/${gadaiId}/detail`).then(r=>r.json())
      .then(j=>{ setGadai(j.data?.gadai); setLoading(false) })
      .catch(()=>setLoading(false))
  },[gadaiId])

  function getJumlah() {
    if (!gadai) return 0
    if (jenis==='PELUNASAN') return gadai.sisaTagihan
    if (jenis==='PERPANJANGAN') {
      const {totalBunga} = hitungBunga({jumlahPinjaman:gadai.jumlahPinjaman,bungaPerBulan:gadai.bungaPerBulan,tenor:tenorBaru})
      return totalBunga
    }
    return gadai.sisaTagihan
  }

  async function handleBayar() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/pembayaran/buat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({gadaiId,jenis,metodePembayaran:metode,tenorBaru:jenis==='PERPANJANGAN'?tenorBaru:undefined,kodePromo:kodePromo||undefined}),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      if (json.data?.paymentUrl) { window.location.href = json.data.paymentUrl; return }
      setSuccess(true)
      toast.success('Pembayaran berhasil!')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  if (success) return (
    <div className="max-w-md mx-auto mt-12 text-center animate-fade-in">
      <div className="card p-10">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5"><CheckCircle2 size={40} className="text-emerald-500"/></div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pembayaran Berhasil!</h2>
        <p className="text-slate-500 mb-6">{jenis==='PELUNASAN'?'Barang siap diambil di kantor kami.':`Tenor diperpanjang ${tenorBaru} hari.`}</p>
        <button onClick={()=>router.push('/riwayat')} className="btn-primary w-full btn-lg">Lihat Riwayat</button>
      </div>
    </div>
  )

  if (loading) return <div className="h-64 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse max-w-xl mx-auto"/>

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <div className="mb-6"><h1 className="page-title">{jenis==='PELUNASAN'?'Tebus Barang':jenis==='PERPANJANGAN'?'Perpanjang Tenor':'Pembayaran'}</h1><p className="page-subtitle">#{gadai?.nomorGadai}</p></div>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><CreditCard size={18} className="text-blue-600"/></div>
          <div><p className="font-semibold text-slate-900 dark:text-white">{gadai?.barang?.nama}</p><p className="text-xs text-slate-400">#{gadai?.nomorGadai}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-slate-100 dark:border-gray-800">
          <div><p className="text-slate-400 text-xs">Sisa tagihan</p><p className="font-bold text-slate-900 dark:text-white">{formatRupiah(gadai?.sisaTagihan||0)}</p></div>
          <div><p className="text-slate-400 text-xs">Jenis pembayaran</p><p className="font-bold text-slate-900 dark:text-white">{jenis}</p></div>
        </div>
      </div>

      {jenis==='PERPANJANGAN'&&(
        <div className="card p-5 mb-4">
          <label className="label">Perpanjang tenor: <strong>{tenorBaru} hari</strong></label>
          <input type="range" min="7" max="60" value={tenorBaru} onChange={e=>setTenorBaru(+e.target.value)} className="w-full accent-blue-600 mt-2"/>
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>7 hari</span><span>60 hari</span></div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-800 text-sm flex justify-between">
            <span className="text-slate-500">Biaya perpanjangan</span>
            <span className="font-bold text-blue-600">{formatRupiah(getJumlah())}</span>
          </div>
        </div>
      )}

      <div className="card p-5 mb-4">
        <h2 className="section-title mb-4">Metode Pembayaran</h2>
        <div className="space-y-2">
          {METODE.map(m=>(
            <button key={m.id} type="button" onClick={()=>setMetode(m.id)}
              className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all',
                metode===m.id?'border-blue-500 bg-blue-50 dark:bg-blue-900/20':'border-slate-200 dark:border-gray-700 hover:border-blue-300')}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',m.bg)}>
                <m.icon size={20} className={m.color}/>
              </div>
              <div className="flex-1"><p className="font-semibold text-sm text-slate-900 dark:text-white">{m.label}</p><p className="text-xs text-slate-400">{m.desc}</p></div>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',metode===m.id?'border-blue-500 bg-blue-500':'border-slate-300')}>
                {metode===m.id&&<div className="w-2 h-2 bg-white rounded-full"/>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <label className="label">Kode Promo (opsional)</label>
        <input value={kodePromo} onChange={e=>setKodePromo(e.target.value.toUpperCase())} className="input" placeholder="Contoh: GADAI10"/>
      </div>

      <div className="card p-5 mb-5 bg-slate-50 dark:bg-gray-800/50">
        <div className="flex justify-between items-center text-sm mb-2"><span className="text-slate-500">Jumlah pembayaran</span><span className="font-bold text-2xl text-slate-900 dark:text-white">{formatRupiah(getJumlah())}</span></div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3"><Shield size={12}/><span>Pembayaran dilindungi enkripsi SSL 256-bit</span></div>
      </div>

      <button onClick={handleBayar} disabled={submitting} className="btn-primary w-full btn-xl gap-2">
        {submitting ? <Loader2 size={20} className="animate-spin"/> : <CreditCard size={20}/>} 
        {submitting ? 'Memproses...' : `Bayar ${formatRupiah(getJumlah())}`}
      </button>
    </div>
  )
}
