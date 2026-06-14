import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requirePetugas } from '@/lib/auth'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    await requirePetugas(req)
    const { searchParams } = new URL(req.url)
    const bulan = parseInt(searchParams.get('bulan') || '6')

    const bulanan = await Promise.all(
      Array.from({ length: bulan }, (_, i) => {
        const tgl = subMonths(new Date(), bulan-1-i)
        const start = startOfMonth(tgl)
        const end = endOfMonth(tgl)
        return Promise.all([
          db.gadai.count({ where: { createdAt: { gte: start, lte: end } } }),
          db.gadai.count({ where: { status: { in: ['AKTIF','DIPERPANJANG'] }, createdAt: { gte: start, lte: end } } }),
          db.gadai.count({ where: { status: 'LUNAS', tanggalDitebus: { gte: start, lte: end } } }),
          db.pembayaran.aggregate({ where: { status: 'SUCCESS', paidAt: { gte: start, lte: end } }, _sum: { totalBayar: true } }),
          db.gadai.aggregate({ where: { status: { in: ['AKTIF','DIPERPANJANG'] }, createdAt: { gte: start, lte: end } }, _sum: { jumlahPinjaman: true } }),
        ]).then(([total, aktif, ditebus, pendapatan, pinjaman]) => ({
          bulan: format(tgl, 'MMM yyyy'),
          totalPengajuan: total, gadaiAktif: aktif, gadaiDitebus: ditebus,
          pendapatan: pendapatan._sum.totalBayar || 0, totalPinjaman: pinjaman._sum.jumlahPinjaman || 0,
        }))
      })
    )

    const [totalNasabah, totalGadai, totalPendapatan, totalPinjaman, byStatusRaw] = await Promise.all([
      db.user.count({ where: { role: 'NASABAH' } }),
      db.gadai.count(),
      db.pembayaran.aggregate({ where: { status: 'SUCCESS' }, _sum: { totalBayar: true } }),
      db.gadai.aggregate({ where: { status: { in: ['AKTIF','JATUH_TEMPO','DIPERPANJANG'] } }, _sum: { jumlahPinjaman: true } }),
      db.gadai.groupBy({ by: ['status'], _count: { id: true } }),
    ])

    const byStatus = byStatusRaw.map(s => ({ status: s.status, total: s._count.id }))

    const byKategori = await db.barangGadai.groupBy({ by: ['kategoriId'], _count: { id: true } })
    const kategoriList = await db.kategoriBarang.findMany()
    const perKategori = byKategori.map(b => ({
      nama: kategoriList.find(k => k.id === b.kategoriId)?.nama || 'Lainnya',
      total: b._count.id,
    }))

    return ok({
      bulanan,
      summary: {
        totalNasabah, totalGadai,
        totalPendapatan: totalPendapatan._sum.totalBayar || 0,
        totalPinjaman: totalPinjaman._sum.jumlahPinjaman || 0,
      },
      byStatus, perKategori,
    })
  } catch (err) { return handleError(err) }
}
