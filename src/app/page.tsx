// src/app/page.tsx
import Link from 'next/link'
import { Shield, Clock, TrendingUp, ChevronRight, Star, Phone, CheckCircle2, Zap, Lock, Award, ArrowRight, MessageCircle, Building2, FileText, Bell } from 'lucide-react'

const stats = [
  { value:'50.000+', label:'Nasabah Aktif' },
  { value:'Rp 500 M+', label:'Dana Dicairkan' },
  { value:'30 Menit', label:'Proses Persetujuan' },
  { value:'4.9★', label:'Rating Kepuasan' },
]
const features = [
  { icon:Zap,     color:'text-blue-400',   bg:'bg-blue-500/10',   title:'Proses Kilat 30 Menit',   desc:'Pengajuan online, verifikasi cepat, dana cair hari yang sama ke rekening Anda.' },
  { icon:Shield,  color:'text-emerald-400',bg:'bg-emerald-500/10',title:'Barang Aman & Diasuransikan', desc:'Gudang berteknologi tinggi, CCTV 24 jam, semua barang diasuransikan penuh.' },
  { icon:TrendingUp,color:'text-amber-400',bg:'bg-amber-500/10',  title:'Bunga Paling Ringan',      desc:'Mulai 1.5%/bulan. Perpanjang tenor kapan saja tanpa penalti tersembunyi.' },
  { icon:Lock,    color:'text-purple-400', bg:'bg-purple-500/10', title:'Keamanan Tingkat Bank',    desc:'Enkripsi SSL, JWT auth, data NIK tidak pernah dijual ke pihak ketiga.' },
  { icon:Award,   color:'text-rose-400',   bg:'bg-rose-500/10',   title:'Terdaftar OJK',            desc:'Beroperasi legal, terdaftar di OJK. Keamanan transaksi Anda terjamin penuh.' },
  { icon:FileText,color:'text-cyan-400',   bg:'bg-cyan-500/10',   title:'Invoice & Dokumen Digital',desc:'Invoice otomatis, unduh PDF, kirim via WhatsApp dan email langsung dari app.' },
]
const categories = [
  { e:'📱', n:'Elektronik',    d:'HP, Laptop, Kamera' },
  { e:'💍', n:'Perhiasan',     d:'Emas, Berlian, Perak' },
  { e:'🏍️', n:'Kendaraan',     d:'Motor, Mobil' },
  { e:'👜', n:'Fashion Mewah', d:'Tas, Jam Tangan' },
  { e:'🎮', n:'Gadget & Game', d:'Konsol, Aksesori' },
  { e:'📦', n:'Lainnya',       d:'Barang Berharga' },
]
const steps = [
  { n:'1', t:'Daftar Akun',      d:'NIK & HP aktif, verifikasi 2 menit' },
  { n:'2', t:'Ajukan Gadai',     d:'Upload foto barang & isi estimasi' },
  { n:'3', t:'Verifikasi Petugas',d:'Penilaian & konfirmasi 30 menit' },
  { n:'4', t:'Dana Cair',        d:'Transfer ke rekening Anda hari ini' },
]
const testimonials = [
  { name:'Budi S.', city:'Jakarta', text:'Prosesnya cepat banget! Ajukan jam 9, dana masuk jam 11. Bunganya ringan dan CS sangat membantu.', r:5 },
  { name:'Sari W.', city:'Surabaya',text:'Awalnya ragu gadai online, tapi GadaiKu terpercaya. Barang dikembalikan utuh setelah lunas.', r:5 },
  { name:'Deni P.', city:'Bandung', text:'Invoice otomatis langsung di WhatsApp. Sangat profesional, recommended!', r:5 },
]
const faqs = [
  { q:'Berapa lama proses persetujuan gadai?', a:'Rata-rata 30 menit setelah dokumen lengkap diterima petugas kami.' },
  { q:'Barang gadai apakah aman?', a:'Ya. Barang disimpan di gudang berteknologi tinggi, dipantau CCTV 24 jam, dan diasuransikan penuh.' },
  { q:'Berapa bunga per bulan?', a:'Mulai dari 1.5% per bulan, tergantung kategori barang dan tenor yang dipilih.' },
  { q:'Metode pembayaran apa saja?', a:'Virtual Account, QRIS, Transfer Bank, E-Wallet (GoPay, OVO, DANA), dan Kartu Kredit/Debit.' },
  { q:'Apakah ada biaya pendaftaran?', a:'Tidak ada. Daftar dan ajukan gadai sepenuhnya gratis.' },
  { q:'Bisa perpanjang tenor?', a:'Bisa. Perpanjangan tenor tersedia kapan saja sebelum jatuh tempo, cukup bayar biaya bunga.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 dark:border-navy-700 bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>G</div>
            <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight">GadaiKu</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            {[['#cara-kerja','Cara Kerja'],['#kategori','Kategori'],['#fitur','Keunggulan'],['#faq','FAQ']].map(([h,l])=>(
              <a key={h} href={h} className="hover:text-blue-600 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-outline text-sm px-4 py-2 hidden sm:flex">Masuk</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#060e1a 0%,#1e3a5f 60%,#162d4a 100%)'}}>
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 20% 50%,rgba(37,99,235,.2) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(245,158,11,.1) 0%,transparent 40%)'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-6 ring-1 ring-white/20" style={{background:'rgba(255,255,255,.08)',backdropFilter:'blur(10px)',color:'#93c5fd'}}>
            <Star size={14} className="fill-current text-amber-400" />
            Terpercaya · Terdaftar OJK · 50.000+ Nasabah Aktif
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-none mb-6 tracking-tight">
            Gadai Cepat,<br />
            <span style={{background:'linear-gradient(135deg,#f59e0b,#fbbf24)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Dana Cair Hari Ini</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform gadai digital premium. Proses 30 menit, bunga mulai 1.5%/bulan, barang dijamin aman & diasuransikan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/register" className="btn-gold btn-xl inline-flex gap-2 shadow-2xl">Gadai Sekarang <ArrowRight size={20} /></Link>
            <Link href="/login"    className="inline-flex items-center justify-center gap-2 text-white border border-white/20 rounded-2xl px-8 py-4 text-lg font-bold hover:bg-white/10 transition-all">Masuk Akun</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="card-glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section id="kategori" className="py-20 bg-slate-50 dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Apa yang Bisa Digadaikan?</h2>
            <p className="text-slate-500 dark:text-slate-400">Kami menerima berbagai jenis barang berharga</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(c => (
              <Link href="/register" key={c.n} className="card-hover p-5 text-center group rounded-2xl">
                <div className="text-4xl mb-3">{c.e}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{c.n}</div>
                <div className="text-xs text-slate-400 mt-1">{c.d}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Cara Kerja GadaiKu</h2>
            <p className="text-slate-500 dark:text-slate-400">4 langkah mudah, dana langsung cair</p>
          </div>
          <div className="grid sm:grid-cols-4 gap-6 relative">
            <div className="hidden sm:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 to-blue-400" />
            {steps.map((s,i) => (
              <div key={s.n} className="text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-xl" style={{background:'linear-gradient(135deg,#1d4ed8,#2563eb)'}}>{s.n}</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{s.t}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="py-20 bg-slate-50 dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Mengapa GadaiKu?</h2>
            <p className="text-slate-500 dark:text-slate-400">Fitur premium untuk pengalaman gadai terbaik</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="card p-6 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4`}><f.icon size={22} className={f.color} /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulasi widget */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl p-10 lg:p-14 text-white" style={{background:'linear-gradient(135deg,#0f2033,#1e3a5f)'}}>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-black mb-3">Simulasi Pinjaman</h2>
                <p className="text-slate-400 mb-6">Hitung estimasi sebelum mengajukan gadai</p>
                <ul className="space-y-2">
                  {['Nilai barang Rp 5.000.000','Dana diterima 75% = Rp 3.750.000','Tenor 30 hari','Bunga 1.5%/bulan = Rp 56.250','Total pelunasan = Rp 3.806.250'].map(t=>(
                    <li key={t} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="card-glass rounded-2xl p-5 space-y-4">
                  {[['Dana Diterima','Rp 3.750.000','text-blue-300'],['Bunga (30 hari)','Rp 56.250','text-amber-300'],['Total Pelunasan','Rp 3.806.250','text-emerald-300']].map(([l,v,c])=>(
                    <div key={l} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                      <span className="text-slate-400 text-sm">{l}</span><span className={`font-bold ${c}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="btn-gold w-full btn-lg justify-center">Ajukan Sekarang</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="py-20 bg-slate-50 dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Apa Kata Mereka?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card p-6 rounded-2xl">
                <div className="flex gap-0.5 mb-4">{Array.from({length:t.r}).map((_,i)=><Star key={i} size={14} className="text-amber-400 fill-current" />)}</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>{t.name[0]}</div>
                  <div><div className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</div><div className="text-xs text-slate-400">{t.city}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f,i) => (
              <div key={i} className="card p-5 rounded-2xl">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.q}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl p-14 text-white" style={{background:'linear-gradient(135deg,#0f2033,#1e3a5f)'}}>
            <h2 className="text-4xl font-black mb-4">Mulai Gadai Sekarang</h2>
            <p className="text-slate-400 mb-8 text-lg">Daftar gratis, proses 30 menit, dana cair hari ini</p>
            <Link href="/register" className="btn-gold btn-xl inline-flex gap-2 shadow-2xl">Daftar Gratis — Mulai Sekarang <ArrowRight size={20} /></Link>
            <div className="flex flex-wrap gap-6 justify-center mt-8">
              {['✅ Tanpa biaya pendaftaran','✅ Proses 30 menit','✅ Data aman & terenkripsi','✅ Terdaftar OJK'].map(t=>(
                <span key={t} className="text-sm text-slate-400">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-navy-700 py-14" style={{background:'#060e1a'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>G</div>
                <span className="font-black text-white">GadaiKu</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Platform gadai digital premium, terdaftar & diawasi OJK.</p>
            </div>
            {[
              { t:'Layanan', l:['Gadai Elektronik','Gadai Perhiasan','Gadai Kendaraan','Gadai Fashion','Simulasi Gadai'] },
              { t:'Perusahaan', l:['Tentang Kami','Karir','Blog','Press Kit','Hubungi Kami'] },
              { t:'Legal', l:['Syarat & Ketentuan','Kebijakan Privasi','Kebijakan Cookie','Keamanan'] },
            ].map(col=>(
              <div key={col.t}>
                <h4 className="font-bold text-white mb-3 text-sm">{col.t}</h4>
                <ul className="space-y-2">{col.l.map(l=><li key={l}><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-2"><Phone size={14} /><span>CS 24 Jam: 0800-4253-2458</span></div>
            <span>© 2026 GadaiKu. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
