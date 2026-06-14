'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Smartphone, Lock, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier || !password) { toast.error('Isi semua field'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ identifier, password })
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Berhasil masuk!')
      const role = json.data?.user?.role
      router.replace(['PETUGAS','SUPERVISOR','ADMIN','OWNER'].includes(role) ? '/backoffice/dashboard' : '/dashboard')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Selamat Datang</h1>
        <p className="text-slate-400 text-sm">Masuk ke akun GadaiKu Anda</p>
      </div>
      <div className="rounded-3xl p-8" style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.1)'}}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Nomor HP atau Email</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="08xxxxxxxxxx atau email@domain.com" className={`${inputCls} pl-10`} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-300">Password</label>
              <Link href="/lupa-password" className="text-xs text-blue-400 hover:underline">Lupa password?</Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Masukkan password" className={`${inputCls} pl-10 pr-10`} />
              <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
            {loading && <Loader2 size={18} className="animate-spin"/>}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"/></div>
          <div className="relative flex justify-center"><span className="bg-transparent px-2 text-xs text-slate-500">atau</span></div>
        </div>
        <Link href="/verifikasi-otp?mode=login" className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-all">
          <Smartphone size={16}/> Masuk dengan Kode OTP
        </Link>
        <p className="text-center text-sm text-slate-500 mt-5">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-400 font-semibold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  )
}
