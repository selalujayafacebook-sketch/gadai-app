'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Users, FileText, Settings, LogOut, Menu, X, ChevronRight, Shield, Bell, Tag, Building2, AlertTriangle, FileCheck, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navGroups = [
  {
    label: 'Dashboard',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'Gadai',
    items: [
      { href: '/admin/gadai/verifikasi', icon: AlertTriangle, label: 'Verifikasi Gadai', badge: true },
      { href: '/admin/gadai', icon: Package, label: 'Semua Gadai' },
    ]
  },
  {
    label: 'Manajemen',
    items: [
      { href: '/admin/nasabah', icon: Users, label: 'Nasabah' },
      { href: '/admin/pengguna', icon: Shield, label: 'Manajemen Pengguna' },
      { href: '/admin/invoice', icon: FileCheck, label: 'Invoice' },
      { href: '/admin/pembayaran-monitor', icon: FileText, label: 'Monitor Pembayaran' },
      { href: '/admin/cabang', icon: Building2, label: 'Cabang' },
      { href: '/admin/promo', icon: Tag, label: 'Promo & Voucher' },
    ]
  },
  {
    label: 'Komunikasi',
    items: [
      { href: '/admin/notifikasi', icon: Bell, label: 'Blast Notifikasi' },
    ]
  },
  {
    label: 'Laporan & Log',
    items: [
      { href: '/admin/laporan', icon: FileText, label: 'Laporan' },
      { href: '/admin/audit-log', icon: Shield, label: 'Audit Log' },
    ]
  },
  {
    label: 'Konfigurasi',
    items: [
      { href: '/admin/pengaturan', icon: Settings, label: 'Pengaturan Sistem' },
    ]
  },
]

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Berhasil keluar')
    router.push('/login')
  }

  return (
    <aside className="flex flex-col h-full bg-slate-900 w-64 p-4 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield size={17} className="text-white" />
          </div>
          <div>
            <div className="text-white font-extrabold text-sm leading-none">GadaiKu</div>
            <div className="text-slate-400 text-xs mt-0.5">Admin Panel</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden"><X size={20} /></button>
        )}
      </div>

      <nav className="flex-1 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'))
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white')}>
                    <item.icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={13} />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 pt-3 mt-3 space-y-1">
        <Link href="/owner/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-400 hover:bg-amber-900/20 transition-all">
          <Crown size={16} /> Owner Dashboard
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-red-400 hover:bg-red-900/20 transition-all">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="hidden lg:flex"><AdminSidebar /></div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full"><AdminSidebar onClose={() => setOpen(false)} /></div>
        </div>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
          <button onClick={() => setOpen(true)} className="text-slate-500"><Menu size={22} /></button>
          <span className="font-bold text-slate-900 dark:text-white">Admin Panel</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin">{children}</div>
      </main>
    </div>
  )
}
