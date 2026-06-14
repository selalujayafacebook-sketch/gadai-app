'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Building2, Users, LogOut, Menu, X, Crown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/owner/dashboard', icon: LayoutDashboard, label: 'Business Overview' },
  { href: '/owner/laporan', icon: TrendingUp, label: 'Laporan Keuangan' },
  { href: '/owner/cabang', icon: Building2, label: 'Statistik Cabang' },
  { href: '/owner/karyawan', icon: Users, label: 'Karyawan' },
]

function OwnerSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Berhasil keluar')
    router.push('/login')
  }

  return (
    <aside className="flex flex-col h-full w-64 p-4" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Crown size={18} className="text-white"/>
          </div>
          <div><div className="text-white font-bold text-sm leading-none">GadaiKu</div><div className="text-amber-400 text-xs mt-0.5 font-medium">Owner Dashboard</div></div>
        </div>
        {onClose && <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden"><X size={20}/></button>}
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white')}>
              <item.icon size={18}/>{item.label}{active && <ChevronRight size={14} className="ml-auto"/>}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 pt-4 mt-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all mb-1">
          <LayoutDashboard size={18}/>Ke Admin Panel
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-red-400 hover:bg-red-900/20 transition-all">
          <LogOut size={18}/>Keluar
        </button>
      </div>
    </aside>
  )
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0b1120' }}>
      <div className="hidden lg:flex"><OwnerSidebar/></div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)}/>
          <div className="relative w-64 h-full"><OwnerSidebar onClose={() => setOpen(false)}/></div>
        </div>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-white/10">
          <button onClick={() => setOpen(true)} className="text-slate-400"><Menu size={22}/></button>
          <span className="text-white font-semibold">Owner Dashboard</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin" style={{ background: '#f8fafc' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
