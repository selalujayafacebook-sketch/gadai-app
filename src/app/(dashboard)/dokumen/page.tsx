'use client'
// src/app/(dashboard)/dokumen/page.tsx
import { useEffect, useState } from 'react'
import { formatDate, formatRupiah } from '@/lib/utils'
import { FileText, Download, Eye, Loader2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function DokumenPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/invoice/list')
      .then(r => r.json())
      .then(j => { setInvoices(j.data?.invoices || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function downloadInvoice(id: string, nomor: string) {
    setDownloading(id)
    try {
      const res = await fetch(`/api/invoice/${id}/download`)
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }

      // Buka invoice HTML di tab baru untuk print/save
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(json.data.html)
        win.document.close()
        win.focus()
        setTimeout(() => win.print(), 500)
      }
      toast.success(`Invoice ${nomor} siap diunduh`)
    } catch { toast.error('Gagal mengunduh invoice') }
    finally { setDownloading(null) }
  }

  async function previewInvoice(id: string) {
    try {
      const res = await fetch(`/api/invoice/${id}/download`)
      const json = await res.json()
      if (!res.ok) { toast.error(json.message); return }
      setPreview(json.data.html)
    } catch { toast.error('Gagal memuat preview') }
  }

  const filtered = invoices.filter(inv =>
    inv.nomorInvoice?.toLowerCase().includes(search.toLowerCase()) ||
    inv.gadai?.nomorGadai?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Dokumen & Invoice</h1>
        <p className="page-subtitle">Unduh surat gadai, invoice, dan bukti pembayaran Anda</p>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Cari nomor invoice atau gadai..." value={search}
          onChange={e => setSearch(e.target.value)} className="input pl-10" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-slate-100 dark:bg-gray-800 rounded-2xl animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Belum ada dokumen</p>
          <p className="text-sm text-slate-400">Invoice akan tersedia setelah pembayaran selesai</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-50 dark:divide-gray-800">
            {filtered.map(inv => (
              <div key={inv.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-gray-800/50">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{inv.nomorInvoice}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {inv.jenis} · #{inv.gadai?.nomorGadai} · {formatDate(inv.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{formatRupiah(inv.total)}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block',
                    inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                    {inv.status}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => previewInvoice(inv.id)}
                    className="btn-secondary p-2 rounded-xl" title="Preview">
                    <Eye size={15} />
                  </button>
                  <button onClick={() => downloadInvoice(inv.id, inv.nomorInvoice)}
                    disabled={downloading === inv.id}
                    className="btn-primary p-2 rounded-xl" title="Download">
                    {downloading === inv.id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
              <span className="font-semibold text-slate-900">Preview Invoice</span>
              <div className="flex gap-2">
                <button onClick={() => {
                  const win = window.open('', '_blank')
                  if (win) { win.document.write(preview); win.document.close(); setTimeout(() => win.print(), 500) }
                }} className="btn-primary gap-2 text-sm">
                  <Download size={14} /> Cetak / Unduh
                </button>
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
