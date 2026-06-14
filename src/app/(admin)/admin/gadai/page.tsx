'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatRupiah, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Search, Package, Eye } from 'lucide-react'
import { useDebounce } from '@/hooks'

const STATUS_LABEL: Record<string,string> = {MENUNGGU_VERIFIKASI:'Menunggu',DITAKSIR:'Ditaksir',DISETUJUI:'Disetujui',AKTIF:'Aktif',JATUH_TEMPO:'Jatuh Tempo',LUNAS:'Lunas',DITOLAK:'Ditolak',LELANG:'Lelang',DIPERPANJANG:'Diperpanjang',REVISI:'Revisi',MENUNGGU_PEMBAYARAN:'Menunggu Bayar'}
const STATUS_COLOR: Record<string,string> = {AKTIF:'badge-aktif',DIPERPANJANG:'badge-aktif',MENUNGGU_VERIFIKASI:'badge-menunggu',DITAKSIR:'badge-menunggu',DISETUJUI:'badge-diproses',JATUH_TEMPO:'badge-jatuh',LUNAS:'badge-lunas',DITOLAK:'badge-ditolak',LELANG:'badge-dilelang',REVISI:'badge-menunggu',MENUNGGU_PEMBAYARAN:'badge-menunggu'}
const TABS = ['Semua','MENUNGGU_VERIFIKASI','DITAKSIR','DISETUJUI','AKTIF','JATUH_TEMPO','LUNAS','DITOLAK']

export default function AdminGadaiPage() {
  const [gadai, setGadai] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Semua')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const dSearch = useDebounce(search, 300)

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ page: String(page), limit: '15' })
    if (tab !== 'Semua') q.set('status', tab)
    fetch(`/api/admin/gadai?${q}`).then(r=>r.json())
      .then(j=>{ setGadai(j.data?.gadai||[]); setTotal(j.data?.pagination?.total||0); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [tab, page])

  const filtered = gadai.filter(g =>
    !dSearch || g.nomorGadai?.toLowerCase().includes(dSearch.toLowerCase()) ||
    g.barang?.nama?.toLowerCase().includes(dSearch.toLowerCase()) ||
    g.user?.nama?.toLowerCase().includes(dSearch.toLowerCase()) ||
    g.user?.noHp?.includes(dSearch)
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">Semua Gadai</h1><p className="page-subtitle">{total} total pengajuan</p></div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input type="text" placeholder="Cari nomor gadai, nama barang, atau nasabah..." value={search}
          onChange={e=>setSearch(e.target.value)} className="input pl-10"/>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {TABS.map(t=>(
          <button key={t} onClick={()=>{setTab(t);setPage(1)}}
            className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all',
              tab===t?'bg-blue-600 text-white':'bg-white dark:bg-gray-800 text-slate-500 border border-slate-200 dark:border-gray-700')}>
            {t==='Semua'?'Semua':STATUS_LABEL[t]||t}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <table className="table">
          <thead><tr><th>Nomor / Barang</th><th>Nasabah</th><th>Pinjaman</th><th>Jatuh Tempo</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {loading?[1,2,3,4,5].map(i=>(<tr key={i}><td colSpan={6}><div className="h-8 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>)):
              filtered.map(g=>(
                <tr key={g.id}>
                  <td><p className="font-semibold text-slate-900 dark:text-white text-sm">{g.barang?.nama||'—'}</p><p className="text-xs text-slate-400">#{g.nomorGadai}</p></td>
                  <td><p className="font-medium text-sm">{g.user?.nama}</p><p className="text-xs text-slate-400">{g.user?.noHp}</p></td>
                  <td className="font-semibold">{formatRupiah(g.jumlahPinjaman)}</td>
                  <td className="text-sm text-slate-500">{g.tanggalJatuhTempo?formatDate(g.tanggalJatuhTempo):'—'}</td>
                  <td><span className={cn('badge',STATUS_COLOR[g.status]||'badge-lunas')}>{STATUS_LABEL[g.status]||g.status}</span></td>
                  <td><Link href={`/admin/gadai/${g.id}`} className="btn-outline p-2 rounded-xl text-xs gap-1 inline-flex"><Eye size={14}/>Detail</Link></td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading&&filtered.length===0&&(<div className="p-12 text-center"><Package size={32} className="mx-auto text-slate-300 mb-3"/><p className="text-slate-400 text-sm">Tidak ada data</p></div>)}
      </div>
      {total>15&&(
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-slate-500">Hal {page} dari {Math.ceil(total/15)}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/15)} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
