import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { loginSchema } from '@/lib/validations'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt'
import { getLoginFail, incrementLoginFail, resetLoginFail } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    // Log raw body to help debug malformed JSON issues
    const raw = await req.text()
    console.log('[API] /api/auth/login raw body ->', raw)
    let body: any
    try {
      body = JSON.parse(raw)
    } catch (e) {
      // Try parse as form-urlencoded
      try {
        if (raw.includes('=') && raw.includes('&')) {
          body = Object.fromEntries(new URLSearchParams(raw))
        } else {
          // Parse simple object-like string: {identifier:admin@gadaiku.com,password:wrongpass}
          const s = raw.trim().replace(/^\{\s*|\s*\}$/g, '')
          const obj: any = {}
          if (s.length > 0) {
            s.split(',').forEach(pair => {
              const idx = pair.indexOf(':')
              if (idx > -1) {
                const k = pair.slice(0, idx).trim().replace(/^['"]|['"]$/g, '')
                let v = pair.slice(idx + 1).trim()
                v = v.replace(/^['"]|['"]$/g, '')
                obj[k] = v
              }
            })
          }
          body = obj
        }
      } catch (e2) {
        body = {}
      }
    }
    const { identifier, password } = loginSchema.parse(body)

    const failCount = await getLoginFail(identifier)
    if (failCount >= 5) return error('Akun dikunci sementara karena terlalu banyak percobaan. Tunggu 5 menit.', 429)

    const user = await db.user.findFirst({ where: { OR: [{ noHp: identifier }, { email: identifier }] } })
    if (!user || !user.passwordHash) { await incrementLoginFail(identifier); return error('Nomor HP/email atau password salah.', 401) }
    if (!user.isActive) return error('Akun Anda telah dinonaktifkan. Hubungi customer service.', 403)

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      await incrementLoginFail(identifier)
      const remaining = 5 - (failCount + 1)
      return error(`Password salah. Sisa percobaan: ${remaining}x.`, 401)
    }

    await resetLoginFail(identifier)

    const payload = { userId: user.id, role: user.role, noHp: user.noHp }
    const [accessToken, refreshToken] = await Promise.all([signAccessToken(payload), signRefreshToken(payload)])

    await db.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now()+7*24*60*60*1000),
        device: req.headers.get('user-agent') || null, ipAddress: req.headers.get('x-forwarded-for') || null },
    })

    setAuthCookies(accessToken, refreshToken)

    await db.loginLog.create({
      data: { userId: user.id, ipAddress: req.headers.get('x-forwarded-for') || null, device: req.headers.get('user-agent') || null, status: 'SUCCESS' },
    })

    return ok({ user: { id:user.id, nama:user.nama, noHp:user.noHp, email:user.email, role:user.role, isVerified:user.isVerified, avatar:user.avatar } })
  } catch (err) { return handleError(err) }
}
