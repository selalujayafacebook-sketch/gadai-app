// src/app/api/admin/audit-log/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requirePetugas } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requirePetugas(req)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const modul = searchParams.get('modul')
    const userId = searchParams.get('userId')

    const where = {
      ...(modul ? { modul } : {}),
      ...(userId ? { userId } : {}),
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: { user: { select: { nama: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ])

    return ok({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (err) { return handleError(err) }
}
