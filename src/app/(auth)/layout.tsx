import Link from 'next/link'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{background:'linear-gradient(135deg,#060e1a 0%,#1e3a5f 50%,#162d4a 100%)'}}>
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 30% 50%,#2563eb 0%,transparent 60%)'}} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl" style={{background:'linear-gradient(135deg,#1d4ed8,#2563eb)'}}>G</div>
            <span className="text-white font-black text-2xl tracking-tight">GadaiKu</span>
          </Link>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">Platform Gadai<br/><span style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Digital Premium</span></h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">Proses cepat, bunga rendah, barang aman. Terdaftar & diawasi OJK.</p>
          {['✅ Proses 30 menit','✅ Bunga mulai 1.5%/bulan','✅ Barang diasuransikan','✅ Data terlindungi enkripsi'].map(t=>(
            <div key={t} className="text-slate-300 text-sm mb-2">{t}</div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
