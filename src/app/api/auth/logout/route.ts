import { NextRequest } from 'next/server'
import { ok, handleError } from '@/lib/api'
import { clearAuthCookies, getRefreshTokenFromCookie } from '@/lib/jwt'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromCookie()
    if (refreshToken) {
      await db.refreshToken.updateMany({ where: { token: refreshToken }, data: { isRevoked: true } })
    }
    clearAuthCookies()
    return ok({ message: 'Berhasil keluar.' })
  } catch (err) { return handleError(err) }
}
