import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const onlyUnread = searchParams.get('unread') === 'true'

    const [notifikasi, unreadCount] = await Promise.all([
      db.notifikasi.findMany({
        where: { userId: user.userId, ...(onlyUnread ? { isRead: false } : {}) },
        orderBy: { createdAt: 'desc' }, take: 30,
      }),
      db.notifikasi.count({ where: { userId: user.userId, isRead: false } }),
    ])

    return ok({ notifikasi, unreadCount })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    await db.notifikasi.updateMany({ where: { userId: user.userId, isRead: false }, data: { isRead: true } })
    return ok({ message: 'Semua notifikasi telah dibaca.' })
  } catch (err) { return handleError(err) }
}
