import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requirePetugas } from '@/lib/auth'


export async function GET(req: NextRequest) {
  try {
    await requirePetugas(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const barang = await db.barangGadai.findMany({
      where: status ? { gadai: { status: status as never } } : {},
      include: {
        kategori: true,
        foto: { take: 1 },
        gadai: {
          select: {
            nomorGadai: true, status: true, tanggalMasuk: true, tanggalJatuhTempo: true, jumlahPinjaman: true,
            user: { select: { nama: true, noHp: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return ok({ barang })
  } catch (err) { return handleError(err) }
}
