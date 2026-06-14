'use client'
// src/app/(dashboard)/referral/page.tsx
import { useEffect, useState } from 'react'
import { Gift, Copy, Share2, Users, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function ReferralPage() {
  const [user, setUser] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/profil').then(r => r.json()),
      fetch('/api/referral').then(r => r.json()),
    ]).then(([u, r]) => {
      setUser(u.data?.user)
      setReferrals(r.data?.referrals || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const referralLink = user ? `${typeof window !== 'undefined' ? window.location.origin : 'https://gadaiku.com'}/register?ref=${user.referralCode}` : ''

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    toast.success('Link referral disalin!')
  }

  function shareWA() {
    const text = encodeURIComponent(`Hei! Coba GadaiKu, platform gadai online terpercaya. Daftar pakai link ku dan dapatkan bonus! ${referralLink}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const berhasil = referrals.filter(r => r.status === 'SUCCESS').length
  const totalBonus = referrals.filter(r => r.isPaid).reduce((s: number, r: any) => s + r.bonusReferrer, 0)

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Program Referral</h1>
        <p className="page-subtitle">Ajak teman, dapatkan bonus untuk setiap yang berhasil gadai</p>
      </div>

      {/* Banner */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-blue-600 to-purple-700 border-0 text-white">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Gift size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Ajak Teman, Dapat Bonus!</h2>
            <p className="text-blue-100 text-sm">Dapatkan <strong className="text-amber-300">Rp 50.000</strong> untuk setiap teman yang berhasil gadai menggunakan kode referral Anda.</p>
          </div>
        </div>

        {/* Kode referral */}
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <p className="text-xs text-blue-200 mb-2 font-medium">KODE REFERRAL ANDA</p>
          <div className="flex items-center justify-between gap-3">
            <code className="text-2xl font-black tracking-[0.2em] text-white">{loading ? '——————' : user?.referralCode || 'LOADING'}</code>
            <button onClick={copyLink} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
              <Copy size={14} /> Salin Kode
            </button>
          </div>
        </div>

        {/* Link referral */}
        <div className="bg-white/10 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-xs">
          <span className="text-blue-200 truncate flex-1">{referralLink || 'Memuat link...'}</span>
          <button onClick={copyLink} className="text-white hover:text-amber-300 transition-colors flex-shrink-0"><Copy size={14} /></button>
        </div>

        <button onClick={shareWA} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
          <Share2 size={16} /> Bagikan via WhatsApp
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Diajak', value: referrals.length, icon: Users, color: 'text-blue-600' },
          { label: 'Berhasil Gadai', value: berhasil, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Total Bonus', value: `Rp ${(totalBonus/1000).toFixed(0)}rb`, icon: Gift, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="metric-card text-center">
            <s.icon size={22} className={cn('mx-auto mb-2', s.color)} />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cara kerja */}
      <div className="card p-5 mb-6">
        <h3 className="section-title mb-4">Cara Kerja Referral</h3>
        <div className="space-y-3">
          {[
            { n: '1', text: 'Bagikan kode atau link referral Anda ke teman' },
            { n: '2', text: 'Teman mendaftar menggunakan kode Anda' },
            { n: '3', text: 'Teman berhasil mengajukan gadai pertama' },
            { n: '4', text: 'Anda mendapatkan bonus Rp 50.000, teman mendapat bonus Rp 25.000' },
          ].map(s => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{s.n}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat referral */}
      {referrals.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-gray-800">
            <h3 className="section-title">Riwayat Referral</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-gray-800">
            {referrals.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">Teman #{i + 1}</p>
                  <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <span className={cn('badge text-xs', r.status === 'SUCCESS' ? 'badge-aktif' : 'badge-menunggu')}>
                    {r.status === 'SUCCESS' ? 'Berhasil' : 'Menunggu'}
                  </span>
                  {r.bonusReferrer > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">+Rp {r.bonusReferrer.toLocaleString('id-ID')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
