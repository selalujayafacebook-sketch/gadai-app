import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, created, handleError } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const cabang = await db.cabang.findMany({
      include: { _count: { select: { users: true, gadai: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return ok({ cabang })
  } catch (err) { return handleError(err) }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const cabang = await db.cabang.create({
      data: { nama: body.nama, kode: body.kode.toUpperCase(), alamat: body.alamat, kota: body.kota, telepon: body.telepon, email: body.email },
    })
    return created({ cabang })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const cabang = await db.cabang.update({
      where: { id: body.id },
      data: { nama: body.nama, alamat: body.alamat, kota: body.kota, telepon: body.telepon, isActive: body.isActive },
    })
    return ok({ cabang })
  } catch (err) { return handleError(err) }
}
