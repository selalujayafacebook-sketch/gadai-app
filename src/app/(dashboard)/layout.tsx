'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, CreditCard, History, Bell, User, Plus, LogOut, Menu, X, ChevronRight, Calculator, FileText, Gift, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Ringkasan' },
  { href: '/gadai',        icon: Package,          label: 'Gadai Saya' },
  { href: '/simulasi',     icon: Calculator,       label: 'Simulasi' },
  { href: '/pembayaran',   icon: CreditCard,       label: 'Pembayaran' },
  { href: '/riwayat',      icon: History,          label: 'Riwayat' },
  { href: '/dokumen',      icon: FileText,         label: 'Dokumen & Invoice' },
  { href: '/notifikasi',   icon: Bell,             label: 'Notifikasi' },
  { href: '/referral',     icon: Gift,             label: 'Referral' },
  { href: '/feedback',     icon: Star,             label: 'Feedback' },
  { href: '/profil',       icon: User,             label: 'Profil' },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Berhasil keluar')
    router.push('/login')
  }

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 w-64 p-4">
      <div className="flex items-center justify-between mb-6 px-1">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40">
            <span className="text-white font-black text-base">G</span>
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white">GadaiKu</span>
            <p className="text-xs text-slate-400 -mt-0.5">Nasabah</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 lg:hidden"><X size={20} /></button>
        )}
      </div>

      <Link href="/gadai/baru" className="btn-primary w-full mb-5 flex items-center justify-center gap-2 text-sm">
        <Plus size={16} /> Ajukan Gadai
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={cn(active ? 'nav-link-active' : 'nav-link')}>
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={13} />}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
        <button onClick={handleLogout} className="nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
          <LogOut size={17} /> Keluar
        </button>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="hidden lg:flex"><Sidebar /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full"><Sidebar onClose={() => setSidebarOpen(false)} /></div>
        </div>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500"><Menu size={22} /></button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">G</span>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">GadaiKu</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
