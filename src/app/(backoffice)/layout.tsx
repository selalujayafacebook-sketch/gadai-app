'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Users, FileText, Settings, LogOut, Menu, X, ChevronRight, Shield, Bell, BarChart2, CreditCard, Search, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const nav = [
  { group:'Utama', items:[
    { href:'/backoffice/dashboard',           icon:LayoutDashboard, label:'Dashboard' },
  ]},
  { group:'Gadai', items:[
    { href:'/backoffice/gadai/verifikasi',    icon:Package, label:'Verifikasi Gadai' },
    { href:'/backoffice/gadai',               icon:Search,  label:'Semua Gadai' },
    { href:'/backoffice/barang',              icon:Package, label:'Barang' },
  ]},
  { group:'Keuangan', items:[
    { href:'/backoffice/pembayaran',          icon:CreditCard,  label:'Pembayaran' },
    { href:'/backoffice/invoice',             icon:FileText,    label:'Invoice' },
    { href:'/backoffice/laporan',             icon:BarChart2,   label:'Laporan' },
  ]},
  { group:'Manajemen', items:[
    { href:'/backoffice/nasabah',             icon:Users,    label:'Nasabah' },
    { href:'/backoffice/notifikasi',          icon:Bell,     label:'Notifikasi' },
    { href:'/backoffice/promo',               icon:Tag,      label:'Promo' },
    { href:'/backoffice/audit',               icon:Shield,   label:'Audit Log' },
  ]},
  { group:'Sistem', items:[
    { href:'/backoffice/pengaturan',          icon:Settings, label:'Pengaturan' },
  ]},
]

function BOS({ onClose }:{ onClose?:()=>void }) {
  const pathname = usePathname()
  const router   = useRouter()
  async function logout() { await fetch('/api/auth/logout',{method:'POST'}); router.push('/login') }
  return (
    <aside className="flex flex-col h-full w-64 overflow-y-auto no-scrollbar" style={{background:'#060e1a',borderRight:'1px solid rgba(255,255,255,.06)'}}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base" style={{background:'linear-gradient(135deg,#1d4ed8,#2563eb)'}}><Shield size={18}/></div>
            <div><div className="font-black text-white text-sm">GadaiKu</div><div className="text-xs text-slate-500">Back Office</div></div>
          </div>
          {onClose&&<button onClick={onClose} className="text-slate-500 hover:text-white lg:hidden"><X size={20}/></button>}
        </div>
      </div>
      <div className="flex-1 p-3 space-y-1">
        {nav.map(g=>(
          <div key={g.group}>
            <div className="nav-group">{g.group}</div>
            {g.items.map(item=>{
              const active=pathname===item.href||pathname.startsWith(item.href+'/')
              return (
                <Link key={item.href} href={item.href} onClick={onClose} className={cn(active?'nav-link-active':'nav-link')}>
                  <item.icon size={16}/>{item.label}
                  {active&&<ChevronRight size={13} className="ml-auto"/>}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10">
        <button onClick={logout} className="nav-link w-full text-red-400 hover:bg-red-900/20"><LogOut size={16}/>Keluar</button>
      </div>
    </aside>
  )
}

export default function BackofficeLayout({ children }:{ children:React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden" style={{background:'#0b1120'}}>
      <div className="hidden lg:flex"><BOS/></div>
      {open&&(<div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/70" onClick={()=>setOpen(false)}/><div className="relative w-64 h-full"><BOS onClose={()=>setOpen(false)}/></div></div>)}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b" style={{background:'#0a1628',borderColor:'rgba(255,255,255,.06)'}}>
          <button onClick={()=>setOpen(true)} className="text-slate-400"><Menu size={22}/></button>
          <span className="font-black text-white">GadaiKu Back Office</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin">{children}</div>
      </main>
    </div>
  )
}