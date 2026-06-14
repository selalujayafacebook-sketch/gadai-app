'use client'
// src/app/(admin)/admin/invoice/page.tsx
import { useEffect, useState } from 'react'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import { FileText, Download, Send, Search, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function AdminInvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/invoice/list')
      .then(r => r.json())
      .then(j => { setInvoices(j.data?.invoices || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleDownload(id: string) {
    setDownloading(id)
    try {
      const res = await fetch(`/api/invoice/${id}/download`)
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      const win = window.open('', '_blank')
      if (win) { win.document.write(json.data.html); win.document.close(); setTimeout(() => win.print(), 500) }
    } catch { toast.error('Gagal mengunduh') }
    finally { setDownloading(null) }
  }

  async function handlePreview(id: string) {
    const res = await fetch(`/api/invoice/${id}/download`)
    const json = await res.json()
    if (res.ok) setPreview(json.data.html)
  }

  async function kirimWA(id: string, noHp: string, nomor: string) {
    toast.success(`Invoice ${nomor} dikirim ke ${noHp} (simulasi)`)
  }

  const filtered = invoices.filter(inv =>
    inv.nomorInvoice?.toLowerCase().includes(search.toLowerCase()) ||
    inv.user?.nama?.toLowerCase().includes(search.toLowerCase()) ||
    inv.gadai?.nomorGadai?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Manajemen Invoice</h1>
        <p className="page-subtitle">{invoices.length} invoice terdaftar</p>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Cari nomor invoice, nama nasabah, atau nomor gadai..." value={search}
          onChange={e => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>No. Invoice</th><th>Nasabah</th><th>Jenis</th><th>Total</th><th>Status</th><th>Tgl</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {loading ? [1,2,3].map(i => (
              <tr key={i}><td colSpan={7}><div className="h-8 bg-slate-100 dark:bg-gray-800 rounded animate-pulse"/></td></tr>
            )) : filtered.map(inv => (
              <tr key={inv.id}>
                <td className="font-mono text-sm font-semibold text-blue-600">{inv.nomorInvoice}</td>
                <td>
                  <p className="font-medium text-sm">{inv.user?.nama}</p>
                  <p className="text-xs text-slate-400">#{inv.gadai?.nomorGadai}</p>
                </td>
                <td><span className="badge badge-diproses text-xs">{inv.jenis}</span></td>
                <td className="font-semibold">{formatRupiah(inv.total)}</td>
                <td>
                  <span className={cn('badge text-xs', inv.status === 'PAID' ? 'badge-aktif' : 'badge-menunggu')}>
                    {inv.status}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{formatDateTime(inv.createdAt)}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => handlePreview(inv.id)} className="btn-secondary p-1.5 rounded-lg" title="Preview">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => handleDownload(inv.id)} disabled={downloading === inv.id}
                      className="btn-primary p-1.5 rounded-lg" title="Download">
                      {downloading === inv.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                    </button>
                    <button onClick={() => kirimWA(inv.id, inv.user?.noHp, inv.nomorInvoice)}
                      className="btn-success p-1.5 rounded-lg" title="Kirim WA">
                      <Send size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">Tidak ada invoice ditemukan</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <span className="font-semibold">Preview Invoice</span>
              <div className="flex gap-2">
                <button onClick={() => {
                  const win = window.open('', '_blank')
                  if (win) { win.document.write(preview); win.document.close(); setTimeout(() => win.print(), 500) }
                }} className="btn-primary text-sm gap-1.5"><Download size={14} />Cetak</button>
                <button onClick={() => setPreview(null)} className="btn-secondary text-sm">Tutup</button>
              </div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: preview }} className="p-4" />
          </div>
        </div>
      )}
    </div>
  )
}
