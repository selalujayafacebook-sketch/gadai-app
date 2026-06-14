'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { User, Phone, Mail, MapPin, Shield, Key, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import { maskPhone } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [tab, setTab] = useState<'profil'|'keamanan'>('profil')
  const [profileForm, setProfileForm] = useState({ nama:'', email:'', alamat:'', kota:'' })
  const [passForm, setPassForm] = useState({ passwordLama:'', passwordBaru:'', confirmPassword:'' })

  useEffect(() => {
    fetch('/api/profil').then(r=>r.json()).then(j=>{
      const u = j.data?.user
      setUser(u)
      setProfileForm({ nama:u?.nama||'', email:u?.email||'', alamat:u?.alamat||'', kota:u?.kota||'' })
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[])

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/profil',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(profileForm)})
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Profil berhasil diperbarui')
      setUser((u:any)=>({...u,...profileForm}))
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSavingProfile(false) }
  }

  async function onChangePass(e: React.FormEvent) {
    e.preventDefault()
    if (passForm.passwordBaru !== passForm.confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return }
    if (passForm.passwordBaru.length < 8) { toast.error('Password minimal 8 karakter'); return }
    setSavingPass(true)
    try {
      const res = await fetch('/api/profil/password',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(passForm)})
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      toast.success('Password berhasil diubah')
      setPassForm({ passwordLama:'', passwordBaru:'', confirmPassword:'' })
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSavingPass(false) }
  }

  if (loading) return <div className="h-64 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6"><h1 className="page-title">Profil Saya</h1><p className="page-subtitle">Kelola informasi akun Anda</p></div>

      <div className="card p-6 mb-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {user?.nama?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.nama}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{maskPhone(user?.noHp||'')}</p>
          <div className="flex gap-2 mt-2">
            {user?.isVerified?<span className="badge badge-aktif"><CheckCircle2 size={11}/>Terverifikasi</span>:<span className="badge badge-menunggu">Belum verifikasi</span>}
            <span className="badge badge-diproses"><Shield size={11}/>{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['profil','keamanan'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={cn('px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize',
              tab===t?'bg-blue-600 text-white':'bg-white dark:bg-gray-800 text-slate-500 border border-slate-200 dark:border-gray-700')}>
            {t==='profil'?'👤 Profil':'🔒 Keamanan'}
          </button>
        ))}
      </div>

      {tab==='profil'&&(
        <div className="card p-6 animate-fade-in">
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div><label className="label">Nama Lengkap</label>
              <div className="input-group"><User size={16} className="input-icon-left"/>
                <input value={profileForm.nama} onChange={e=>setProfileForm(p=>({...p,nama:e.target.value}))} className="input-with-icon" placeholder="Nama lengkap"/></div></div>
            <div><label className="label">Nomor HP <span className="text-slate-400 font-normal text-xs">(tidak bisa diubah)</span></label>
              <div className="input-group"><Phone size={16} className="input-icon-left"/>
                <input value={maskPhone(user?.noHp||'')} disabled className="input-with-icon opacity-60 cursor-not-allowed"/></div></div>
            <div><label className="label">Email</label>
              <div className="input-group"><Mail size={16} className="input-icon-left"/>
                <input type="email" value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))} className="input-with-icon" placeholder="email@domain.com"/></div></div>
            <div><label className="label">Alamat</label>
              <div className="input-group"><MapPin size={16} className="input-icon-left"/>
                <input value={profileForm.alamat} onChange={e=>setProfileForm(p=>({...p,alamat:e.target.value}))} className="input-with-icon" placeholder="Alamat lengkap"/></div></div>
            <div><label className="label">Kota</label>
              <input value={profileForm.kota} onChange={e=>setProfileForm(p=>({...p,kota:e.target.value}))} className="input" placeholder="Kota domisili"/></div>
            <button type="submit" disabled={savingProfile} className="btn-primary w-full btn-lg mt-2">
              {savingProfile&&<Loader2 size={18} className="animate-spin"/>}{savingProfile?'Menyimpan...':'Simpan Perubahan'}
            </button>
          </form>
        </div>
      )}

      {tab==='keamanan'&&(
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-5"><Key size={18} className="text-blue-600"/><h3 className="section-title">Ubah Password</h3></div>
          <form onSubmit={onChangePass} className="space-y-4">
            <div><label className="label">Password Lama</label>
              <div className="relative">
                <input value={passForm.passwordLama} onChange={e=>setPassForm(p=>({...p,passwordLama:e.target.value}))} type={showOldPass?'text':'password'} className="input pr-10" placeholder="Masukkan password lama"/>
                <button type="button" onClick={()=>setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showOldPass?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div></div>
            <div><label className="label">Password Baru</label>
              <div className="relative">
                <input value={passForm.passwordBaru} onChange={e=>setPassForm(p=>({...p,passwordBaru:e.target.value}))} type={showNewPass?'text':'password'} className="input pr-10" placeholder="Min. 8 karakter, huruf kapital & angka"/>
                <button type="button" onClick={()=>setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showNewPass?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div></div>
            <div><label className="label">Konfirmasi Password Baru</label>
              <input value={passForm.confirmPassword} onChange={e=>setPassForm(p=>({...p,confirmPassword:e.target.value}))} type="password" className="input" placeholder="Ulangi password baru"/></div>
            <button type="submit" disabled={savingPass} className="btn-primary w-full btn-lg">
              {savingPass&&<Loader2 size={18} className="animate-spin"/>}{savingPass?'Menyimpan...':'Ubah Password'}
            </button>
          </form>
          <div className="divider"/>
          <div className="alert-info text-xs"><Shield size={14} className="inline mr-1"/>Setelah password diubah, semua sesi aktif di perangkat lain akan otomatis logout.</div>
        </div>
      )}
    </div>
  )
}
