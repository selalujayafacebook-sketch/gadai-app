'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah, formatDate, formatDateTime, sisaHari } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Package, ArrowLeft, CreditCard, RefreshCw, Download, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

const STATUS_LABEL: Record<string,string> = {
  MENUNGGU_VERIFIKASI:'Menunggu Verifikasi',DITAKSIR:'Ditaksir',DISETUJUI:'Disetujui',
  DITOLAK:'Ditolak',REVISI:'Perlu Revisi',MENUNGGU_PEMBAYARAN:'Menunggu Pembayaran',
  AKTIF:'Aktif',JATUH_TEMPO:'Jatuh Tempo',DIPERPANJANG:'Diperpanjang',LUNAS:'Lunas',LELANG:'Lelang'
}
const STATUS_COLOR: Record<string,string> = {
  AKTIF:'badge-aktif',DIPERPANJANG:'badge-aktif',MENUNGGU_VERIFIKASI:'badge-menunggu',
  DITAKSIR:'badge-menunggu',DISETUJUI:'badge-diproses',MENUNGGU_PEMBAYARAN:'badge-menunggu',
  JATUH_TEMPO:'badge-jatuh',LUNAS:'badge-lunas',DITOLAK:'badge-ditolak',LELANG:'badge-dilelang',REVISI:'badge-menunggu'
}

export default function DetailGadaiPage() {
  const { id } = useParams()
  const router = useRouter()
  const [gadai, setGadai] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/gadai/${id}/detail`).then(r=>r.json())
      .then(j=>{ setGadai(j.data?.gadai); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [id])

  if (loading) return <div className="space-y-4 animate-pulse max-w-3xl mx-auto"><div className="h-8 w-48 bg-slate-100 dark:bg-gray-800 rounded-xl"/><div className="h-64 bg-slate-100 dark:bg-gray-800 rounded-2xl"/></div>
  if (!gadai) return <div className="text-center py-20"><XCircle size={40} className="mx-auto text-red-400 mb-3"/><p className="text-slate-500">Data tidak ditemukan</p><Link href="/gadai" className="btn-primary mt-4 inline-flex">Kembali</Link></div>

  const sisa = gadai.tanggalJatuhTempo ? sisaHari(gadai.tanggalJatuhTempo) : null
  const aktif = ['AKTIF','DIPERPANJANG','JATUH_TEMPO'].includes(gadai.status)

  const timeline = [
    {status:'MENUNGGU_VERIFIKASI',label:'Pengajuan Diterima',done:true},
    {status:'DITAKSIR',label:'Penilaian Barang',done:['DITAKSIR','DISETUJUI','MENUNGGU_PEMBAYARAN','AKTIF','DIPERPANJANG','JATUH_TEMPO','LUNAS','LELANG'].includes(gadai.status)},
    {status:'DISETUJUI',label:'Persetujuan',done:['DISETUJUI','MENUNGGU_PEMBAYARAN','AKTIF','DIPERPANJANG','JATUH_TEMPO','LUNAS'].includes(gadai.status)},
    {status:'AKTIF',label:'Dana Cair',done:['AKTIF','DIPERPANJANG','JATUH_TEMPO','LUNAS'].includes(gadai.status)},
    {status:'LUNAS',label:'Pelunasan',done:gadai.status==='LUNAS'},
  ]

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>router.back()} className="btn-secondary p-2.5 rounded-xl"><ArrowLeft size={18}/></button>
        <div><h1 className="page-title">Detail Gadai</h1><p className="page-subtitle">#{gadai.nomorGadai}</p></div>
        <span className={cn('badge ml-auto text-sm px-3 py-1.5',STATUS_COLOR[gadai.status]||'badge-lunas')}>{STATUS_LABEL[gadai.status]||gadai.status}</span>
      </div>

      {sisa!==null&&sisa<=7&&gadai.status==='AKTIF'&&(
        <div className="alert-warn mb-4 flex gap-3 items-center">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0"/>
          <span><strong>Perhatian!</strong> Gadai jatuh tempo dalam <strong>{sisa} hari</strong> ({formatDate(gadai.tanggalJatuhTempo)}). Segera bayar atau perpanjang.</span>
        </div>
      )}
      {gadai.status==='JATUH_TEMPO'&&(
        <div className="alert-danger mb-4 flex gap-3 items-center">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0"/>
          <span><strong>Gadai sudah jatuh tempo!</strong> Segera lakukan pelunasan untuk menghindari proses lelang.</span>
        </div>
      )}

      {/* Timeline */}
      <div className="card p-5 mb-4">
        <h2 className="section-title mb-4">Status Pengajuan</h2>
        <div className="flex items-center">
          {timeline.map((t,i)=>(
            <div key={t.status} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                  t.done?'bg-emerald-500 text-white':gadai.status===t.status?'bg-blue-600 text-white':'bg-slate-100 dark:bg-gray-800 text-slate-400')}>
                  {t.done?<CheckCircle2 size={16}/>:i+1}
                </div>
                <p className="text-xs text-center mt-1 text-slate-500 max-w-16">{t.label}</p>
              </div>
              {i<4&&<div className={cn('flex-1 h-0.5 mb-4',t.done?'bg-emerald-400':'bg-slate-200 dark:bg-gray-700')}/>}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Info barang */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4"><Package size={16} className="text-blue-600"/><h2 className="section-title">Informasi Barang</h2></div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[['Nama Barang',gadai.barang?.nama||'—'],['Kategori',gadai.barang?.kategori?.nama||'—'],['Merk/Model',[gadai.barang?.merk,gadai.barang?.model].filter(Boolean).join(' / ')||'—'],['Kondisi',gadai.barang?.kondisi||'—'],['Nilai Taksiran',formatRupiah(gadai.nilaiTaksiran)],['Deskripsi',gadai.barang?.deskripsi||'—']].map(([k,v])=>(
              <div key={k} className={k==='Deskripsi'?'col-span-2':''}>
                <p className="text-slate-400 text-xs mb-1">{k}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info pinjaman */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4"><CreditCard size={16} className="text-blue-600"/><h2 className="section-title">Detail Pinjaman</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[['Pinjaman',formatRupiah(gadai.jumlahPinjaman)],['Bunga/Bln',`${gadai.bungaPerBulan}%`],['Tenor',`${gadai.tenor} hari`],['Total Bunga',formatRupiah(gadai.totalBunga)],['Total Denda',formatRupiah(gadai.totalDenda||0)],['Total Bayar',formatRupiah(gadai.totalBayar)],['Sisa Tagihan',formatRupiah(gadai.sisaTagihan)],['Tgl Masuk',formatDate(gadai.tanggalMasuk)],['Jatuh Tempo',gadai.tanggalJatuhTempo?formatDate(gadai.tanggalJatuhTempo):'—']].map(([k,v])=>(
              <div key={k}><p className="text-slate-400 text-xs mb-1">{k}</p><p className="font-semibold text-slate-900 dark:text-white">{v}</p></div>
            ))}
          </div>
          {gadai.catatanPetugas&&<div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-700 dark:text-amber-400"><strong>Catatan petugas:</strong> {gadai.catatanPetugas}</div>}
        </div>

        {/* Riwayat status */}
        {gadai.riwayatStatus?.length>0&&(
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-blue-600"/><h2 className="section-title">Riwayat Status</h2></div>
            <div className="space-y-2">
              {gadai.riwayatStatus.map((r: any)=>(
                <div key={r.id} className="flex items-start gap-3 text-sm py-2 border-b border-slate-50 dark:border-gray-800 last:border-0">
                  <span className={cn('badge text-xs mt-0.5',STATUS_COLOR[r.statusBaru]||'badge-lunas')}>{STATUS_LABEL[r.statusBaru]||r.statusBaru}</span>
                  <div className="flex-1">{r.catatan&&<p className="text-slate-500">{r.catatan}</p>}<p className="text-xs text-slate-400 mt-0.5">{formatDateTime(r.createdAt)}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Riwayat pembayaran */}
        {gadai.pembayaran?.length>0&&(
          <div className="card p-5">
            <h2 className="section-title mb-4">Riwayat Pembayaran</h2>
            <div className="space-y-2">
              {gadai.pembayaran.map((p: any)=>(
                <div key={p.id} className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-gray-800 last:border-0 text-sm">
                  <div><p className="font-medium text-slate-900 dark:text-white">{p.jenis}</p><p className="text-xs text-slate-400">{p.paidAt?formatDateTime(p.paidAt):formatDate(p.createdAt)}</p></div>
                  <div className="text-right"><p className="font-bold">{formatRupiah(p.jumlah)}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',p.status==='SUCCESS'?'bg-emerald-50 text-emerald-600':p.status==='PENDING'?'bg-amber-50 text-amber-600':'bg-red-50 text-red-600')}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {aktif&&(
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/pembayaran?gadaiId=${gadai.id}&jenis=PELUNASAN`} className="btn-primary flex-1 btn-lg justify-center gap-2"><CreditCard size={18}/>Tebus Barang</Link>
            <Link href={`/pembayaran?gadaiId=${gadai.id}&jenis=PERPANJANGAN`} className="btn-outline flex-1 btn-lg justify-center gap-2"><RefreshCw size={18}/>Perpanjang Tenor</Link>
            <button onClick={()=>window.open(`/api/invoice/list?gadaiId=${gadai.id}`,'_blank')} className="btn-secondary flex-1 btn-lg justify-center gap-2"><Download size={18}/>Invoice</button>
          </div>
        )}
      </div>
    </div>
  )
}
