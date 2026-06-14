// src/app/api/referral/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const referrals = await db.referral.findMany({
      where: { referrerId: auth.userId },
      orderBy: { createdAt: 'desc' },
    })
    return ok({ referrals })
  } catch (err) { return handleError(err) }
}
