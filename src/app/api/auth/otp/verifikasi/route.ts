import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { verifyOtpSchema } from '@/lib/validations'
import { getOtp, deleteOtp } from '@/lib/redis'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { noHp, kode, purpose } = verifyOtpSchema.parse(body)

    const otpHash = await getOtp(noHp)
    if (!otpHash) return error('Kode OTP sudah kedaluwarsa. Minta kode baru.', 410)

    const valid = await bcrypt.compare(kode, otpHash)
    if (!valid) {
      await db.otpCode.updateMany({ where: { noHp, purpose, isUsed: false }, data: { attempts: { increment: 1 } } })
      return error('Kode OTP salah.', 401)
    }

    await deleteOtp(noHp)
    await db.otpCode.updateMany({ where: { noHp, purpose, isUsed: false }, data: { isUsed: true } })

    const user = await db.user.findUnique({ where: { noHp } })
    if (!user) return error('User tidak ditemukan.', 404)

    if (purpose === 'REGISTER') {
      await db.user.update({ where: { id: user.id }, data: { isVerified: true } })
    }

    if (purpose === 'LOGIN' || purpose === 'REGISTER') {
      const payload = { userId: user.id, role: user.role, noHp: user.noHp }
      const [accessToken, refreshToken] = await Promise.all([signAccessToken(payload), signRefreshToken(payload)])

      await db.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now()+7*24*60*60*1000),
          device: req.headers.get('user-agent') || null, ipAddress: req.headers.get('x-forwarded-for') || null },
      })

      setAuthCookies(accessToken, refreshToken)

      return ok({ message: 'Verifikasi berhasil.', user: { id:user.id, nama:user.nama, noHp:user.noHp, role:user.role, isVerified:true } })
    }

    return ok({ message: 'OTP valid. Silakan buat password baru.', verified: true })
  } catch (err) { return handleError(err) }
}
