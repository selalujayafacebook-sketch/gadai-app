import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requirePetugas } from '@/lib/auth'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    await requirePetugas(req)
    const now = new Date()
    const bulanIni = { gte: startOfMonth(now), lte: endOfMonth(now) }
    const bulanLalu = { gte: startOfMonth(subMonths(now,1)), lte: endOfMonth(subMonths(now,1)) }

    const [
      totalNasabah, totalGadaiAktif, totalGadaiMenunggu, totalGadaiJatuhTempo,
      pendapatanBulanIni, pendapatanBulanLalu, gadaiTerbaru, nasabahTerbaru, totalPinjaman,
    ] = await Promise.all([
      db.user.count({ where: { role: 'NASABAH' } }),
      db.gadai.count({ where: { status: { in: ['AKTIF','DIPERPANJANG'] } } }),
      db.gadai.count({ where: { status: 'MENUNGGU_VERIFIKASI' } }),
      db.gadai.count({ where: { status: 'JATUH_TEMPO' } }),
      db.pembayaran.aggregate({ where: { status: 'SUCCESS', paidAt: bulanIni }, _sum: { totalBayar: true } }),
      db.pembayaran.aggregate({ where: { status: 'SUCCESS', paidAt: bulanLalu }, _sum: { totalBayar: true } }),
      db.gadai.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { user: { select: { nama:true, noHp:true } }, barang: { select: { nama:true, kategori: { select: { nama:true } } } } },
      }),
      db.user.findMany({
        where: { role: 'NASABAH' }, take: 5, orderBy: { createdAt: 'desc' },
        select: { id:true, nama:true, noHp:true, isVerified:true, createdAt:true },
      }),
      db.gadai.aggregate({ where: { status: { in: ['AKTIF','JATUH_TEMPO','DIPERPANJANG'] } }, _sum: { jumlahPinjaman: true } }),
    ])

    return ok({
      stats: {
        totalNasabah, totalGadaiAktif, totalGadaiMenunggu, totalGadaiJatuhTempo,
        totalPinjaman: totalPinjaman._sum.jumlahPinjaman || 0,
        pendapatanBulanIni: pendapatanBulanIni._sum.totalBayar || 0,
        pendapatanBulanLalu: pendapatanBulanLalu._sum.totalBayar || 0,
      },
      gadaiTerbaru, nasabahTerbaru,
    })
  } catch (err) { return handleError(err) }
}
