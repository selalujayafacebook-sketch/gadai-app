// src/app/api/admin/pembayaran/[id]/verifikasi/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, notFound, handleError } from '@/lib/api'
import { requirePetugas } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { createNotifikasi } from '@/lib/notification'
import { formatRupiah } from '@/lib/utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requirePetugas(req)

    const pembayaran = await db.pembayaran.findUnique({
      where: { id: params.id },
      include: { gadai: true },
    })
    if (!pembayaran) return notFound('Pembayaran tidak ditemukan')

    await db.pembayaran.update({
      where: { id: params.id },
      data: { status: 'SUCCESS', paidAt: new Date() },
    })

    // Update gadai jika pelunasan
    if (pembayaran.jenis === 'PELUNASAN') {
      await db.gadai.update({
        where: { id: pembayaran.gadaiId },
        data: { status: 'LUNAS', sisaTagihan: 0, tanggalLunas: new Date(), tanggalDitebus: new Date() },
      })
    } else if (pembayaran.jenis === 'PERPANJANGAN' && pembayaran.tenorBaru) {
      const jt = new Date()
      jt.setDate(jt.getDate() + pembayaran.tenorBaru)
      await db.gadai.update({
        where: { id: pembayaran.gadaiId },
        data: { tanggalJatuhTempo: jt, status: 'AKTIF' },
      })
    }

    // Notifikasi nasabah
    await createNotifikasi({
      userId: pembayaran.userId,
      gadaiId: pembayaran.gadaiId,
      judul: 'Pembayaran Dikonfirmasi',
      pesan: `Pembayaran ${pembayaran.jenis} sebesar ${formatRupiah(pembayaran.jumlah)} telah dikonfirmasi oleh petugas.`,
      tipe: 'PEMBAYARAN_SUKSES',
    })

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      aksi: 'VERIFIKASI_MANUAL',
      modul: 'PEMBAYARAN',
      targetId: params.id,
      detail: `Verifikasi manual pembayaran ${pembayaran.nomorPembayaran}`,
      req,
    })

    return ok({ message: 'Pembayaran berhasil diverifikasi.' })
  } catch (err) { return handleError(err) }
}
