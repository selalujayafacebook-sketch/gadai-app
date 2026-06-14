'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function VerifikasiOtpClient() {
  const router = useRouter()
  const params = useSearchParams()
  const noHp   = params.get('noHp') || ''
  const mode   = params.get('mode') || 'login'
  const via    = params.get('via')  || 'sms'
  const [otp, setOtp]           = useState(['','','','','',''])
  const [loading, setLoading]   = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [devOtp, setDevOtp]     = useState('')
  const refs = useRef<(HTMLInputElement|null)[]>([])

  useEffect(()=>{ if(noHp) sendOtp(false) },[])
  useEffect(()=>{
    if(countdown<=0){setCanResend(true);return}
    const t=setTimeout(()=>setCountdown(c=>c-1),1000)
    return()=>clearTimeout(t)
  },[countdown])

  async function sendOtp(isResend=true){
    if(isResend&&resendCount>=3){toast.error('Batas 3x pengiriman tercapai');return}
    try{
      const res=await fetch('/api/auth/otp/kirim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({noHp,via,purpose:mode==='register'?'REGISTER':mode==='reset'?'RESET_PASSWORD':'LOGIN'})})
      const json=await res.json()
      if(!res.ok){toast.error(json.message);return}
      if(json.data?._devOtp) setDevOtp(json.data._devOtp)
      if(isResend){setResendCount(c=>c+1);setCountdown(60);setCanResend(false);toast.success('Kode baru dikirim')}
    }catch{toast.error('Gagal kirim OTP')}
  }

  function handleInput(val:string,i:number){
    if(!/^\d*$/.test(val))return
    const n=[...otp];n[i]=val.slice(-1);setOtp(n)
    if(val&&i<5)refs.current[i+1]?.focus()
  }
  function handleKey(e:React.KeyboardEvent,i:number){if(e.key==='Backspace'&&!otp[i]&&i>0)refs.current[i-1]?.focus()}
  function handlePaste(e:React.ClipboardEvent){e.preventDefault();const t=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);const n=[...otp];t.split('').forEach((c,i)=>{n[i]=c});setOtp(n);refs.current[Math.min(t.length,5)]?.focus()}

  async function verify(){
    const kode=otp.join('')
    if(kode.length<6){toast.error('Masukkan 6 digit OTP');return}
    setLoading(true)
    try{
      const purpose=mode==='register'?'REGISTER':mode==='reset'?'RESET_PASSWORD':'LOGIN'
      const res=await fetch('/api/auth/otp/verifikasi',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({noHp,kode,purpose})})
      const json=await res.json()
      if(!res.ok){toast.error(json.message);setOtp(['','','','','','']);refs.current[0]?.focus();return}
      toast.success('Verifikasi berhasil!')
      if(mode==='reset') router.push(`/lupa-password?step=reset&noHp=${encodeURIComponent(noHp)}`)
      else{const role=json.data?.user?.role;router.replace(['PETUGAS','SUPERVISOR','ADMIN','OWNER'].includes(role)?'/backoffice/dashboard':'/dashboard')}
    }catch{toast.error('Terjadi kesalahan')}
    finally{setLoading(false)}
  }

  return (
    <div className="animate-fade-in text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)'}}>
        <Smartphone size={28} className="text-emerald-400"/>
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Masukkan Kode OTP</h1>
      <p className="text-slate-400 text-sm mb-6">Dikirim via {via==='wa'?'WhatsApp':'SMS'} ke <strong className="text-white">{noHp.slice(0,4)}-xxxx-{noHp.slice(-4)}</strong></p>
      {devOtp&&<div className="mb-4 p-3 rounded-xl text-xs" style={{background:'rgba(37,99,235,.15)',border:'1px solid rgba(37,99,235,.3)',color:'#93c5fd'}}><strong>Dev Mode — OTP:</strong> <strong className="tracking-widest text-white">{devOtp}</strong></div>}
      <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
        {otp.map((v,i)=>(
          <input key={i} ref={el=>{refs.current[i]=el}} maxLength={1} inputMode="numeric" value={v} onChange={e=>handleInput(e.target.value,i)} onKeyDown={e=>handleKey(e,i)}
            className="w-12 h-14 text-center text-2xl font-black rounded-xl border-2 bg-white/5 text-white transition-all focus:outline-none"
            style={{borderColor:v?'#2563eb':'rgba(255,255,255,.1)',background:v?'rgba(37,99,235,.15)':'rgba(255,255,255,.05)'}}/>
        ))}
      </div>
      <div className="text-sm mb-5 text-slate-400">
        {canResend
          ? resendCount<3?<button onClick={()=>sendOtp(true)} className="text-blue-400 font-semibold flex items-center gap-1.5 mx-auto"><RefreshCw size={14}/>Kirim ulang ({3-resendCount} sisa)</button>:<span>Batas tercapai</span>
          : <span>Kirim ulang dalam <strong className="text-white">{countdown}s</strong></span>}
      </div>
      <button onClick={verify} disabled={loading||otp.some(d=>!d)} className="btn-primary w-full btn-lg">
        {loading&&<Loader2 size={18} className="animate-spin"/>}{loading?'Memverifikasi...':'Verifikasi'}
      </button>
      <button onClick={()=>router.back()} className="mt-3 text-sm text-slate-500 hover:text-slate-300">← Kembali</button>
    </div>
  )
}
