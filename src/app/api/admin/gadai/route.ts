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
    const [gadai, total] = await Promise.all([
      db.gadai.findMany({
        where,
        include: { user: { select: { nama:true, noHp:true } }, barang: { select: { nama:true, kategori: { select: { nama:true } } } } },
        orderBy: { createdAt: 'desc' }, skip: (page-1)*limit, take: limit,
      }),
      db.gadai.count({ where }),
    ])
    return ok({ gadai, pagination: { page, limit, total, pages: Math.ceil(total/limit) } })
  } catch (err) { return handleError(err) }
}
