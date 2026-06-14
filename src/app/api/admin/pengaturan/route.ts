import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const settings = await db.pengaturanSistem.findMany({ orderBy: { kunci: 'asc' } })
    return ok({ settings })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const updates = Array.isArray(body) ? body : [body]
    const results = await Promise.all(
      updates.map((u: { kunci: string; nilai: string }) =>
        db.pengaturanSistem.upsert({ where: { kunci: u.kunci }, update: { nilai: u.nilai }, create: { kunci: u.kunci, nilai: u.nilai } })
      )
    )
    return ok({ settings: results })
  } catch (err) { return handleError(err) }
}
