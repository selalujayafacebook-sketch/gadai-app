import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError, AppError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { generateNomorInvoice, generateInvoiceHTML } from '@/lib/invoice'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
    const { pembayaranId } = await req.json()

    const pembayaran = await db.pembayaran.findUnique({
      where: { id: pembayaranId },
      include: { gadai: { include: { barang: { include: { kategori: true } }, user: true } }, user: true },
    })
    if (!pembayaran) throw new AppError('Pembayaran tidak ditemukan', 404)
    if (pembayaran.status !== 'SUCCESS') throw new AppError('Pembayaran belum sukses', 400)

    const settings = await db.pengaturanSistem.findMany({
      where: { kunci: { in: ['NAMA_PERUSAHAAN','ALAMAT','TELEPON_CS','EMAIL_CS','INVOICE_PREFIX','INVOICE_FOOTER'] } },
    })
    const getSetting = (k:string) => settings.find(s=>s.kunci===k)?.nilai || ''
    const nomorInvoice = generateNomorInvoice(getSetting('INVOICE_PREFIX') || 'INV')

    const items = [{ deskripsi: `Pokok Pinjaman - ${pembayaran.gadai.barang?.nama}`, jumlah: pembayaran.gadai.jumlahPinjaman }]
    if (pembayaran.gadai.totalBunga > 0) items.push({ deskripsi: `Bunga ${pembayaran.gadai.bungaPerBulan}%/bulan × ${pembayaran.gadai.tenor} hari`, jumlah: pembayaran.gadai.totalBunga })
    if (pembayaran.gadai.totalDenda > 0) items.push({ deskripsi: 'Denda Keterlambatan', jumlah: pembayaran.gadai.totalDenda })

    const invoiceData = {
      nomorInvoice, nomorGadai: pembayaran.gadai.nomorGadai, tanggal: new Date(),
      nasabah: { nama: pembayaran.user.nama, noHp: pembayaran.user.noHp, alamat: pembayaran.user.alamat || undefined },
      barang: { nama: pembayaran.gadai.barang?.nama || '—', kategori: pembayaran.gadai.barang?.kategori?.nama || '—', kondisi: pembayaran.gadai.barang?.kondisi || '—' },
      items, subtotal: pembayaran.gadai.jumlahPinjaman, bunga: pembayaran.gadai.totalBunga, denda: pembayaran.gadai.totalDenda,
      biayaAdmin: pembayaran.biayaAdmin, total: pembayaran.totalBayar, metodePembayaran: pembayaran.metodePembayaran || undefined,
      perusahaan: { nama: getSetting('NAMA_PERUSAHAAN'), alamat: getSetting('ALAMAT'), telepon: getSetting('TELEPON_CS'), email: getSetting('EMAIL_CS') },
      footer: getSetting('INVOICE_FOOTER'), jenis: pembayaran.jenis,
    }

    const htmlContent = generateInvoiceHTML(invoiceData)

    const invoice = await db.invoice.create({
      data: {
        nomorInvoice, gadaiId: pembayaran.gadaiId, userId: pembayaran.userId, jenis: pembayaran.jenis,
        subtotal: pembayaran.gadai.jumlahPinjaman, biayaAdmin: pembayaran.biayaAdmin, bunga: pembayaran.gadai.totalBunga,
        denda: pembayaran.gadai.totalDenda, total: pembayaran.totalBayar, status: 'PAID',
        items: { create: items.map(i=>({ deskripsi: i.deskripsi, jumlah: i.jumlah })) },
      },
    })

    await db.pembayaran.update({ where: { id: pembayaranId }, data: { invoiceId: invoice.id } })

    return ok({ invoice, htmlContent })
  } catch (err) { return handleError(err) }
}
