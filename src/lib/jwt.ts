// src/lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const AS = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'access-secret-min-32-chars!!!!!'
)

const RS = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'refresh-secret-min-32-chars!!!!'
)

export interface JwtPayload {
  userId: string
  role: string
  noHp: string
}

/* =========================
   TOKEN
========================= */

export const signAccess = (p: JwtPayload) =>
  new SignJWT(p as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(AS)

export const signRefresh = (p: JwtPayload) =>
  new SignJWT(p as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(RS)

export const verifyAccess = async (t: string) => {
  const { payload } = await jwtVerify(t, AS)
  return payload as unknown as JwtPayload
}

export const verifyRefresh = async (t: string) => {
  const { payload } = await jwtVerify(t, RS)
  return payload as unknown as JwtPayload
}

// Compatibility aliases for older import names
export const signAccessToken = signAccess
export const signRefreshToken = signRefresh
export const verifyAccessToken = verifyAccess
export const verifyRefreshToken = verifyRefresh

/* =========================
   COOKIES (SERVER ONLY)
========================= */

export function setAuthCookies(access: string, refresh: string) {
  const c = cookies()

  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }

  c.set('access_token', access, {
    ...opts,
    maxAge: 60 * 15,
  })

  c.set('refresh_token', refresh, {
    ...opts,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookies() {
  const c = cookies()
  c.delete('access_token')
  c.delete('refresh_token')
}

export const getAccess = () => cookies().get('access_token')?.value
export const getRefresh = () => cookies().get('refresh_token')?.value

export const getRefreshTokenFromCookie = () => getRefresh() || null