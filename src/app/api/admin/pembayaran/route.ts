// src/app/api/admin/pembayaran/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requirePetugas } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requirePetugas(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = status ? { status: status as never } : {}

    const [payments, total] = await Promise.all([
      db.pembayaran.findMany({
        where,
        include: {
          gadai: { select: { nomorGadai: true } },
          user: { select: { nama: true, noHp: true } },
          invoice: { select: { nomorInvoice: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.pembayaran.count({ where }),
    ])

    return ok({ payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (err) { return handleError(err) }
}
