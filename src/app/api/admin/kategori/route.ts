import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, created, handleError } from '@/lib/api'
import { requireAuth, requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const kategori = await db.kategoriBarang.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } })
    return ok({ kategori })
  } catch (err) { return handleError(err) }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const kategori = await db.kategoriBarang.create({
      data: { nama: body.nama, deskripsi: body.deskripsi, persenMaks: body.persenMaks || 75 },
    })
    return created({ kategori })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const kategori = await db.kategoriBarang.update({
      where: { id: body.id },
      data: { nama: body.nama, deskripsi: body.deskripsi, persenMaks: body.persenMaks, isActive: body.isActive },
    })
    return ok({ kategori })
  } catch (err) { return handleError(err) }
}
