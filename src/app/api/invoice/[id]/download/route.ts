import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, notFound, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { generateInvoiceHTML } from '@/lib/invoice'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)
    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
      include: { items: true, gadai: { include: { barang: { include: { kategori: true } } } }, user: true },
    })
    if (!invoice) return notFound('Invoice tidak ditemukan')

    const isOwner = invoice.userId === auth.userId
    const isStaff = ['PETUGAS','SUPERVISOR','ADMIN','OWNER'].includes(auth.role)
    if (!isOwner && !isStaff) return notFound()

    const settings = await db.pengaturanSistem.findMany({
      where: { kunci: { in: ['NAMA_PERUSAHAAN','ALAMAT','TELEPON_CS','EMAIL_CS','INVOICE_FOOTER'] } },
    })
    const getSetting = (k:string) => settings.find(s=>s.kunci===k)?.nilai || ''

    const html = generateInvoiceHTML({
      nomorInvoice: invoice.nomorInvoice, nomorGadai: invoice.gadai.nomorGadai, tanggal: invoice.createdAt,
      nasabah: { nama: invoice.user.nama, noHp: invoice.user.noHp, alamat: invoice.user.alamat || undefined },
      barang: { nama: invoice.gadai.barang?.nama || '—', kategori: invoice.gadai.barang?.kategori?.nama || '—', kondisi: invoice.gadai.barang?.kondisi || '—' },
      items: invoice.items.map(i=>({ deskripsi: i.deskripsi, jumlah: i.jumlah })),
      subtotal: invoice.subtotal, bunga: invoice.bunga, denda: invoice.denda, biayaAdmin: invoice.biayaAdmin, total: invoice.total,
      perusahaan: { nama: getSetting('NAMA_PERUSAHAAN'), alamat: getSetting('ALAMAT'), telepon: getSetting('TELEPON_CS'), email: getSetting('EMAIL_CS') },
      footer: getSetting('INVOICE_FOOTER'), jenis: invoice.jenis,
    })

    return ok({ html, invoice })
  } catch (err) { return handleError(err) }
}
