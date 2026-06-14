import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, notFound, handleError } from '@/lib/api'
import { requirePetugas } from '@/lib/auth'
import { updateStatusGadaiSchema } from '@/lib/validations'
import { hitungBunga } from '@/lib/utils'
import { createAuditLog } from '@/lib/audit'
import { createNotifikasi } from '@/lib/notification'
import { formatRupiah } from '@/lib/utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requirePetugas(req)
    const body = await req.json()
    const data = updateStatusGadaiSchema.parse(body)

    const gadai = await db.gadai.findUnique({ where: { id: params.id } })
    if (!gadai) return notFound()

    let updateData: Record<string, unknown> = {
      status: data.status,
      petugasId: user.userId,
      catatanPetugas: data.catatanPetugas || null,
    }

    if (data.status === 'DISETUJUI' || data.status === 'AKTIF') {
      const jumlahPinjaman = data.jumlahPinjaman || gadai.jumlahPinjaman
      const bungaPerBulan = data.bungaPerBulan || gadai.bungaPerBulan
      const { totalBunga, totalBayar } = hitungBunga({ jumlahPinjaman, bungaPerBulan, tenor: gadai.tenor })

      const jatuhTempo = new Date()
      jatuhTempo.setDate(jatuhTempo.getDate() + gadai.tenor)

      updateData = {
        ...updateData,
        jumlahPinjaman, bungaPerBulan, totalBunga, totalBayar,
        sisaTagihan: totalBayar, tanggalJatuhTempo: jatuhTempo, tanggalMasuk: new Date(),
        status: data.status === 'AKTIF' ? 'AKTIF' : 'DISETUJUI',
      }
    }

    if (data.status === 'LUNAS' || data.status === 'DITEBUS') {
      updateData.tanggalDitebus = new Date()
      updateData.tanggalLunas = new Date()
      updateData.sisaTagihan = 0
      updateData.status = 'LUNAS'
    }

    const updated = await db.gadai.update({ where: { id: params.id }, data: updateData })

    await db.riwayatStatusGadai.create({
      data: {
        gadaiId: params.id, statusLama: gadai.status, statusBaru: updated.status,
        catatan: data.catatanPetugas || null, changedBy: user.userId,
      },
    })

    const pesanMap: Record<string,string> = {
      AKTIF: `Pengajuan gadai Anda (${gadai.nomorGadai}) disetujui. Dana akan segera dicairkan.`,
      DISETUJUI: `Pengajuan gadai Anda (${gadai.nomorGadai}) disetujui.`,
      DITOLAK: `Maaf, pengajuan gadai Anda (${gadai.nomorGadai}) ditolak. ${data.catatanPetugas || ''}`,
      JATUH_TEMPO: `Gadai Anda (${gadai.nomorGadai}) telah jatuh tempo. Segera lakukan pelunasan.`,
      LUNAS: `Gadai Anda (${gadai.nomorGadai}) telah lunas. Terima kasih!`,
    }

    if (pesanMap[updated.status]) {
      await createNotifikasi({
        userId: gadai.userId, gadaiId: gadai.id,
        judul: `Status gadai diperbarui: ${updated.status}`,
        pesan: pesanMap[updated.status], tipe: 'STATUS_GADAI',
      })
    }

    await createAuditLog({
      userId: user.userId, aksi: 'UPDATE_STATUS_GADAI', modul: 'GADAI', targetId: params.id,
      detail: `${gadai.status} -> ${updated.status}`, req,
    })

    return ok({ gadai: updated })
  } catch (err) { return handleError(err) }
}
