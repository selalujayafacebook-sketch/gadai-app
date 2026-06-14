// src/app/api/admin/promo/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, created, error, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const promo = await db.promo.findMany({ orderBy: { createdAt: 'desc' } })
    return ok({ promo })
  } catch (err) { return handleError(err) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const promo = await db.promo.create({
      data: {
        nama: body.nama,
        kode: body.kode.toUpperCase(),
        deskripsi: body.deskripsi,
        tipe: body.tipe,
        nilai: body.nilai,
        minPinjaman: body.minPinjaman || null,
        maxPenggunaan: body.maxPenggunaan || null,
        berlakuDari: new Date(body.berlakuDari),
        berlakuHingga: new Date(body.berlakuHingga),
      },
    })
    return created({ promo })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const promo = await db.promo.update({
      where: { id: body.id },
      data: { isActive: body.isActive, nama: body.nama, nilai: body.nilai },
    })
    return ok({ promo })
  } catch (err) { return handleError(err) }
}
