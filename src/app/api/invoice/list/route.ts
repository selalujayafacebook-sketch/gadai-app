import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const isStaff = ['PETUGAS','SUPERVISOR','ADMIN','OWNER'].includes(auth.role)
    const { searchParams } = new URL(req.url)
    const gadaiId = searchParams.get('gadaiId')

    const invoices = await db.invoice.findMany({
      where: { ...(isStaff ? {} : { userId: auth.userId }), ...(gadaiId ? { gadaiId } : {}) },
      include: { gadai: { select: { nomorGadai: true } }, items: true, user: { select: { nama: true, noHp: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return ok({ invoices })
  } catch (err) { return handleError(err) }
}
