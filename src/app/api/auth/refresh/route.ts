import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, unauthorized, handleError } from '@/lib/api'
import { verifyRefreshToken, signAccessToken, signRefreshToken, getRefreshTokenFromCookie, setAuthCookies } from '@/lib/jwt'
import { isTokenBlacklisted } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromCookie()
    if (!refreshToken) return unauthorized('Refresh token tidak ditemukan.')

    const blacklisted = await isTokenBlacklisted(refreshToken)
    if (blacklisted) return unauthorized('Token sudah tidak valid.')

    const payload = await verifyRefreshToken(refreshToken)

    const tokenRecord = await db.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!tokenRecord || tokenRecord.isRevoked) return unauthorized('Token tidak valid.')
    if (tokenRecord.expiresAt < new Date()) return unauthorized('Token sudah kedaluwarsa.')

    const user = await db.user.findUnique({ where: { id: payload.userId } })
    if (!user || !user.isActive) return unauthorized('Akun tidak aktif.')

    const newPayload = { userId: user.id, role: user.role, noHp: user.noHp }
    const [newAccess, newRefresh] = await Promise.all([signAccessToken(newPayload), signRefreshToken(newPayload)])

    await db.refreshToken.update({ where: { id: tokenRecord.id }, data: { isRevoked: true } })
    await db.refreshToken.create({
      data: { token: newRefresh, userId: user.id, expiresAt: new Date(Date.now()+7*24*60*60*1000),
        device: req.headers.get('user-agent') || null, ipAddress: req.headers.get('x-forwarded-for') || null },
    })

    setAuthCookies(newAccess, newRefresh)
    return ok({ message: 'Token diperbarui.' })
  } catch (err) { return handleError(err) }
}
