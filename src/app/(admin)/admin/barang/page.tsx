'use client'
import { useEffect, useState } from 'react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Package, Search } from 'lucide-react'
import { useDebounce } from '@/hooks'

const STATUS_FILTER = ['Semua','AKTIF','DIPERPANJANG','JATUH_TEMPO','LUNAS','LELANG']
const STATUS_LABEL: Record<string,string> = {AKTIF:'Aktif',DIPERPANJANG:'Diperpanjang',JATUH_TEMPO:'Jatuh Tempo',LUNAS:'Lunas',LELANG:'Lelang',MENUNGGU_VERIFIKASI:'Menunggu',DITAKSIR:'Ditaksir',DISETUJUI:'Disetujui',DITOLAK:'Ditolak',REVISI:'Revisi',MENUNGGU_PEMBAYARAN:'Menunggu Bayar'}
const STATUS_COLOR: Record<string,string> = {AKTIF:'badge-aktif',DIPERPANJANG:'badge-aktif',JATUH_TEMPO:'badge-jatuh',LUNAS:'badge-lunas',LELANG:'badge-dilelang',MENUNGGU_VERIFIKASI:'badge-menunggu',DITAKSIR:'badge-menunggu',DISETUJUI:'badge-diproses',DITOLAK:'badge-ditolak'}

export default function AdminBarangPage() {
  const [barang, setBarang] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const dSearch = useDebounce(search)

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filter !== 'Semua') q.set('status', filter)
    fetch(`/api/admin/barang?${q}`).then(r=>r.json())
      .then(j=>{ setBarang(j.data?.barang||[]); setLoading(false) }).catch(()=>setLoading(false))
  }, [filter])

  const filtered = barang.filter(b =>
    !dSearch || b.nama?.toLowerCase().includes(dSearch.toLowerCase()) ||
    b.merk?.toLowerCase().includes(dSearch.toLowerCase()) ||
    b.gadai?.nomorGadai?.toLowerCase().includes(dSearch.toLowerCase()) ||
    b.gadai?.user?.nama?.toLowerCase().includes(dSearch.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">Daftar Barang Gadai</h1><p className="page-subtitle">Tracking semua barang yang sedang dalam sistem gadai</p></div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Cari nama barang, merk, nomor gadai, atau nasabah..." value={search}
            onChange={e=>setSearch(e.target.value)} className="input pl-10"/>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTER.map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={cn('px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                filter===f?'bg-blue-600 text-white':'btn-outline')}>{f==='Semua'?'Semua':STATUS_LABEL[f]||f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label:'Total Barang', value: barang.length, color:'text-blue-600' },
          { label:'Sedang Aktif', value: barang.filter(b=>['AKTIF','DIPERPANJANG'].includes(b.gadai?.status)).length, color:'text-emerald-600' },
          { label:'Sudah Ditebus', value: barang.filter(b=>b.gadai?.status==='LUNAS').length, color:'text-slate-500' },
        ].map(s=>(
          <div key={s.label} className="metric-card text-center">
            <p className={cn('text-2xl font-bold',s.color)}>{loading?'—':s.value}</p>
            <p className="metric-label mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead><tr><th>Barang</th><th>Nasabah</th><th>Nilai Taksiran</th><th>Tgl Masuk</th><th>Jatuh Tempo</th><th>Status Gadai</th></tr></thead>
          <tbody>
            {loading?[1,2,3,4].map(i=>(<tr key={i}><td colSpan={6}><div className="h-8 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>)):
              filtered.map(b=>(
                <tr key={b.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"><Package size={16} className="text-slate-400"/></div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{b.nama}</p>
                        <p className="text-xs text-slate-400">{[b.merk,b.model].filter(Boolean).join(' · ')}</p>
                        <p className="text-xs text-slate-400">#{b.gadai?.nomorGadai} · {b.kategori?.nama}</p>
                      </div>
                    </div>
                  </td>
                  <td><p className="font-medium text-sm">{b.gadai?.user?.nama}</p><p className="text-xs text-slate-400">{b.gadai?.user?.noHp}</p></td>
                  <td className="font-semibold">{formatRupiah(b.nilaiTaksiran)}</td>
                  <td className="text-sm text-slate-500">{b.gadai?.tanggalMasuk?formatDate(b.gadai.tanggalMasuk):'—'}</td>
                  <td className="text-sm text-slate-500">{b.gadai?.tanggalJatuhTempo?formatDate(b.gadai.tanggalJatuhTempo):'—'}</td>
                  <td><span className={cn('badge',STATUS_COLOR[b.gadai?.status]||'badge-lunas')}>{STATUS_LABEL[b.gadai?.status]||b.gadai?.status||'—'}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading&&filtered.length===0&&(<div className="p-12 text-center"><Package size={32} className="mx-auto text-slate-300 mb-3"/><p className="text-slate-400 text-sm">Tidak ada barang ditemukan</p></div>)}
      </div>
    </div>
  )
}
