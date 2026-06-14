'use client'
import { useEffect, useState } from 'react'
import { formatRelative } from '@/lib/utils'
import { Bell, CheckCheck, AlertTriangle, CreditCard, Info, CheckCircle2, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const TIPE_ICON: Record<string,React.ReactNode> = {
  JATUH_TEMPO:<AlertTriangle size={18} className="text-amber-500"/>,PEMBAYARAN_SUKSES:<CreditCard size={18} className="text-emerald-500"/>,
  STATUS_GADAI:<CheckCircle2 size={18} className="text-blue-500"/>,SISTEM:<Info size={18} className="text-slate-400"/>,PROMO:<Gift size={18} className="text-purple-500"/>
}
const TIPE_BG: Record<string,string> = {
  JATUH_TEMPO:'bg-amber-50 dark:bg-amber-900/20',PEMBAYARAN_SUKSES:'bg-emerald-50 dark:bg-emerald-900/20',
  STATUS_GADAI:'bg-blue-50 dark:bg-blue-900/20',PROMO:'bg-purple-50 dark:bg-purple-900/20',SISTEM:'bg-slate-50 dark:bg-gray-800'
}

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifikasi').then(r=>r.json())
      .then(j=>{ setNotifs(j.data?.notifikasi||[]); setLoading(false) })
      .catch(()=>setLoading(false))
  },[])

  async function markAllRead() {
    await fetch('/api/notifikasi',{method:'PATCH'})
    setNotifs(prev=>prev.map(n=>({...n,isRead:true})))
    toast.success('Semua notifikasi ditandai dibaca')
  }

  const unread = notifs.filter(n=>!n.isRead).length

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title">Notifikasi</h1><p className="page-subtitle">{unread>0?`${unread} belum dibaca`:'Semua sudah dibaca'}</p></div>
        {unread>0&&<button onClick={markAllRead} className="btn-secondary gap-2 text-sm"><CheckCheck size={16}/>Tandai semua dibaca</button>}
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div>
      ) : notifs.length===0 ? (
        <div className="card p-16 text-center"><Bell size={40} className="mx-auto text-slate-300 mb-3"/><p className="font-semibold text-slate-900 dark:text-white mb-1">Tidak ada notifikasi</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-50 dark:divide-gray-800">
            {notifs.map(n=>(
              <div key={n.id} className={cn('flex gap-4 p-4',!n.isRead&&'bg-blue-50/50 dark:bg-blue-900/10')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',TIPE_BG[n.tipe]||'bg-slate-50')}>
                  {TIPE_ICON[n.tipe]||<Info size={18} className="text-slate-400"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('font-semibold text-sm',!n.isRead?'text-slate-900 dark:text-white':'text-slate-600 dark:text-slate-400')}>{n.judul}</p>
                    {!n.isRead&&<div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"/>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.pesan}</p>
                  <p className="text-xs text-slate-400 mt-1.5">{formatRelative(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
