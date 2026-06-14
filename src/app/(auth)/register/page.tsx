'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react'

function PasswordCheck({ password }: { password: string }) {
  const checks = [
    { ok: password.length >= 8, label: 'Minimal 8 karakter' },
    { ok: /[A-Z]/.test(password), label: 'Huruf kapital' },
    { ok: /[0-9]/.test(password), label: 'Angka' },
  ]
  return (
    <div className="flex gap-3 flex-wrap mt-2">
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-1 text-xs">
          {c.ok ? <CheckCircle2 size={12} className="text-emerald-400"/> : <XCircle size={12} className="text-slate-500"/>}
          <span className={c.ok ? 'text-emerald-400' : 'text-slate-500'}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nama:'', nik:'', noHp:'', email:'', password:'', confirm:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Konfirmasi password tidak cocok'); return }
    if (form.nik.length !== 16) { toast.error('NIK harus 16 digit'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Akun dibuat! Verifikasi nomor HP.')
      router.push(`/verifikasi-otp?noHp=${encodeURIComponent(form.noHp)}&mode=register`)
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  const inp = "w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
  const lbl = "block text-sm font-semibold text-slate-300 mb-1.5"

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-white mb-2">Buat Akun</h1>
        <p className="text-slate-400 text-sm">Daftar gratis, tidak ada biaya pendaftaran</p>
      </div>
      <div className="rounded-3xl p-7" style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.1)'}}>
        <form onSubmit={onSubmit} className="space-y-3">
          <div><label className={lbl}>Nama Lengkap <span className="text-red-400">*</span></label><input value={form.nama} onChange={e=>set('nama',e.target.value)} placeholder="Sesuai KTP" className={inp}/></div>
          <div><label className={lbl}>NIK (16 digit) <span className="text-red-400">*</span></label><input value={form.nik} onChange={e=>set('nik',e.target.value.replace(/\D/g,'').slice(0,16))} placeholder="3201xxxxxxxxxxxxxxxx" className={inp}/></div>
          <div><label className={lbl}>Nomor HP Aktif <span className="text-red-400">*</span></label><input value={form.noHp} onChange={e=>set('noHp',e.target.value)} placeholder="08xxxxxxxxxx" className={inp}/></div>
          <div><label className={lbl}>Email <span className="text-slate-500 font-normal text-xs">(opsional)</span></label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@domain.com" className={inp}/></div>
          <div>
            <label className={lbl}>Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type={showPass?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min. 8 karakter" className={`${inp} pr-10`}/>
              <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPass?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
            {form.password && <PasswordCheck password={form.password}/>}
          </div>
          <div><label className={lbl}>Konfirmasi Password <span className="text-red-400">*</span></label><input type="password" value={form.confirm} onChange={e=>set('confirm',e.target.value)} placeholder="Ulangi password" className={inp}/></div>
          <div className="flex items-start gap-2 pt-1">
            <input type="checkbox" id="tos" required className="mt-0.5 w-auto accent-blue-500"/>
            <label htmlFor="tos" className="text-xs text-slate-400">Saya setuju dengan <Link href="#" className="text-blue-400 hover:underline">Syarat & Ketentuan</Link> dan <Link href="#" className="text-blue-400 hover:underline">Kebijakan Privasi</Link></label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
            {loading&&<Loader2 size={18} className="animate-spin"/>}
            {loading?'Mendaftarkan...':'Daftar Sekarang'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">Sudah punya akun? <Link href="/login" className="text-blue-400 font-semibold hover:underline">Masuk</Link></p>
      </div>
    </div>
  )
}