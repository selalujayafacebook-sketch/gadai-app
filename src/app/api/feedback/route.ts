// src/app/api/feedback/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, created, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const isPublic = searchParams.get('public') === 'true'

    const feedbacks = await db.feedback.findMany({
      where: isPublic ? { isPublic: true } : { userId: auth.userId },
      include: { user: { select: { nama: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return ok({ feedbacks })
  } catch (err) { return handleError(err) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return ok({ message: 'Rating 1-5' })
    }

    const feedback = await db.feedback.create({
      data: {
        userId: auth.userId,
        gadaiId: body.gadaiId || null,
        rating: body.rating,
        kategori: body.kategori || 'LAINNYA',
        pesan: body.pesan || null,
        isPublic: body.isPublic || false,
      },
    })
    return created({ feedback })
  } catch (err) { return handleError(err) }
}
