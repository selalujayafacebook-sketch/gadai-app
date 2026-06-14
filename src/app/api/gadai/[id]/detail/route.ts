import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, notFound, forbidden, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)

    const gadai = await db.gadai.findUnique({
      where: { id: params.id },
      include: {
        barang: { include: { kategori: true, foto: true } },
        pembayaran: { orderBy: { createdAt: 'desc' } },
        riwayatStatus: { orderBy: { createdAt: 'asc' } },
        user: { select: { nama: true, noHp: true, email: true, alamat: true } },
      },
    })

    if (!gadai) return notFound('Data gadai tidak ditemukan.')

    const isOwner = gadai.userId === user.userId
    const isStaff = ['PETUGAS','SUPERVISOR','ADMIN','OWNER'].includes(user.role)

    if (!isOwner && !isStaff) return forbidden()

    return ok({ gadai })
  } catch (err) { return handleError(err) }
}
