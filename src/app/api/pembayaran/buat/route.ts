import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError, AppError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { buatPembayaranSchema } from '@/lib/validations'
import { generateNomorPembayaran, hitungBunga } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const body = await req.json()
    const data = buatPembayaranSchema.parse(body)

    const gadai = await db.gadai.findUnique({ where: { id: data.gadaiId } })
    if (!gadai) throw new AppError('Data gadai tidak ditemukan', 404)
    if (gadai.userId !== user.userId) throw new AppError('Akses ditolak', 403)
    if (!['AKTIF','JATUH_TEMPO','DIPERPANJANG'].includes(gadai.status)) throw new AppError('Gadai tidak dalam status aktif', 400)

    let jumlah = 0
    if (data.jenis === 'PELUNASAN') {
      jumlah = gadai.sisaTagihan
    } else if (data.jenis === 'PERPANJANGAN' && data.tenorBaru) {
      const { totalBunga } = hitungBunga({ jumlahPinjaman: gadai.jumlahPinjaman, bungaPerBulan: gadai.bungaPerBulan, tenor: data.tenorBaru })
      jumlah = totalBunga
    }

    // Promo
    let diskon = 0
    if ((body as any).kodePromo) {
      const promo = await db.promo.findUnique({ where: { kode: (body as any).kodePromo.toUpperCase() } })
      if (promo && promo.isActive && new Date() <= promo.berlakuHingga && new Date() >= promo.berlakuDari) {
        if (!promo.maxPenggunaan || promo.totalDigunakan < promo.maxPenggunaan) {
          if (!promo.minPinjaman || gadai.jumlahPinjaman >= promo.minPinjaman) {
            if (promo.tipe === 'POTONGAN_BUNGA') diskon = Math.round(jumlah * (promo.nilai/100))
            else if (promo.tipe === 'CASHBACK') diskon = promo.nilai
            await db.promo.update({ where: { id: promo.id }, data: { totalDigunakan: { increment: 1 } } })
          }
        }
      }
    }

    const totalBayar = Math.max(0, jumlah - diskon)
    const nomorPembayaran = generateNomorPembayaran()
    const expiredAt = new Date(Date.now() + 60*60*1000)

    const pembayaran = await db.pembayaran.create({
      data: {
        nomorPembayaran, gadaiId: data.gadaiId, userId: user.userId,
        jenis: data.jenis as never, jumlah, totalBayar, biayaAdmin: 0,
        metodePembayaran: data.metodePembayaran, status: 'PENDING',
        tenorBaru: data.tenorBaru || null, expiredAt,
      },
    })

    // Demo: simulasikan sukses langsung jika metode bukan via Midtrans real
    const midtransKey = process.env.MIDTRANS_SERVER_KEY
    if (!midtransKey) {
      await db.pembayaran.update({ where: { id: pembayaran.id }, data: { status: 'SUCCESS', paidAt: new Date() } })

      if (data.jenis === 'PELUNASAN') {
        await db.gadai.update({ where: { id: data.gadaiId }, data: { status: 'LUNAS', sisaTagihan: 0, tanggalDitebus: new Date(), tanggalLunas: new Date() } })
      } else if (data.jenis === 'PERPANJANGAN' && data.tenorBaru) {
        const jatuhTempo = new Date()
        jatuhTempo.setDate(jatuhTempo.getDate() + data.tenorBaru)
        await db.gadai.update({ where: { id: data.gadaiId }, data: { tanggalJatuhTempo: jatuhTempo, status: 'AKTIF', tenor: gadai.tenor + data.tenorBaru } })
      }

      await db.notifikasi.create({
        data: { userId: user.userId, gadaiId: data.gadaiId, judul: 'Pembayaran Berhasil',
          pesan: `Pembayaran ${data.jenis} sebesar Rp ${totalBayar.toLocaleString('id-ID')} berhasil.`, tipe: 'PEMBAYARAN_SUKSES' },
      })

      // Auto-generate invoice
      try {
        const { generateNomorInvoice } = await import('@/lib/invoice')
        const settings = await db.pengaturanSistem.findMany({ where: { kunci: { in: ['INVOICE_PREFIX'] } } })
        const prefix = settings.find(s=>s.kunci==='INVOICE_PREFIX')?.nilai || 'INV'
        const nomorInvoice = generateNomorInvoice(prefix)
        const gadaiFresh = await db.gadai.findUnique({ where: { id: data.gadaiId }, include: { barang: true } })

        const items = [{ deskripsi: `${data.jenis} - ${gadaiFresh?.barang?.nama || 'Barang'}`, jumlah: jumlah }]
        if (diskon > 0) items.push({ deskripsi: 'Diskon Promo', jumlah: -diskon })

        const invoice = await db.invoice.create({
          data: {
            nomorInvoice, gadaiId: data.gadaiId, userId: user.userId, jenis: data.jenis,
            subtotal: jumlah, biayaAdmin: 0, bunga: gadaiFresh?.totalBunga || 0, denda: gadaiFresh?.totalDenda || 0,
            total: totalBayar, status: 'PAID',
            items: { create: items.map(i=>({ deskripsi: i.deskripsi, jumlah: i.jumlah })) },
          },
        })
        await db.pembayaran.update({ where: { id: pembayaran.id }, data: { invoiceId: invoice.id } })
      } catch { /* non-blocking */ }

      return ok({ pembayaran, paymentUrl: null, diskon })
    }

    // TODO: Integrasi Midtrans Snap untuk produksi
    return ok({ pembayaran, paymentUrl: null, diskon })
  } catch (err) { return handleError(err) }
}
