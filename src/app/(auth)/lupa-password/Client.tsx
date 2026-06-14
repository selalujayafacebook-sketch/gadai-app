'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Loader2, Eye, EyeOff, CheckCircle2, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LupaPasswordClient() {
  const router = useRouter()
  const params = useSearchParams()
  const step = params.get('step') || 'phone'
  const noHpParam = params.get('noHp') || ''
  const [noHp, setNoHp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!noHp) { toast.error('Masukkan nomor HP'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/kirim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noHp, via: 'sms', purpose: 'RESET_PASSWORD' }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Kode OTP dikirim!')
      router.push(`/verifikasi-otp?noHp=${encodeURIComponent(noHp)}&mode=reset&via=sms`)
    } catch { toast.error('Gagal mengirim OTP') }
    finally { setLoading(false) }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Password tidak cocok'); return }
    if (password.length < 8) { toast.error('Password minimal 8 karakter'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noHp: noHpParam, password }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      setDone(true)
      toast.success('Password berhasil diubah!')
      setTimeout(() => router.push('/login'), 2000)
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className="card p-10 text-center animate-fade-in">
      <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password Berhasil Diubah!</h2>
      <p className="text-slate-500 text-sm">Mengarahkan ke halaman login...</p>
    </div>
  )

  if (step === 'reset') return (
    <div className="card p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Buat Password Baru</h1>
      <p className="text-slate-500 text-sm mb-6">Buat password baru yang kuat untuk akun Anda</p>
      <form onSubmit={onReset} className="space-y-4">
        <div>
          <label className="label">Password Baru</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="input pr-10" placeholder="Min. 8 karakter" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Konfirmasi Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={cn('input', confirm && confirm !== password && 'input-error')} placeholder="Ulangi password" />
          {confirm && confirm !== password && <p className="text-red-500 text-xs mt-1">Password tidak cocok</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>
    </div>
  )

  return (
    <div className="card p-8 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-5">
        <Phone size={26} className="text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-1">Lupa Password?</h1>
      <p className="text-slate-500 text-sm text-center mb-6">Masukkan nomor HP terdaftar untuk menerima kode OTP</p>
      <form onSubmit={onSendOtp} className="space-y-4">
        <div>
          <label className="label">Nomor HP Terdaftar</label>
          <input type="tel" value={noHp} onChange={e => setNoHp(e.target.value)} className="input" placeholder="08xxxxxxxxxx" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-5">
        Ingat password? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Masuk</Link>
      </p>
    </div>
  )
}
