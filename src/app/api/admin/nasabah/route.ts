import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const users = await db.user.findMany({
      where: { role: 'NASABAH' },
      orderBy: { createdAt: 'desc' },
      select: { id:true, nama:true, noHp:true, email:true, isVerified:true, isActive:true, createdAt:true },
    })
    return ok({ users })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    if (!body.id) return error('ID nasabah diperlukan.', 400)
    if (typeof body.isActive !== 'boolean') return error('Status aktif harus bernilai true atau false.', 400)

    const user = await db.user.update({
      where: { id: body.id },
      data: { isActive: body.isActive },
      select: { id:true, nama:true, noHp:true, email:true, isVerified:true, isActive:true, createdAt:true },
    })

    return ok({ user })
  } catch (err) { return handleError(err) }
}
