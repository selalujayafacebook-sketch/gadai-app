import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { loginOtpSchema } from '@/lib/validations'
import { setOtp, incrementOtpRequest } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { noHp, via, purpose } = { ...loginOtpSchema.parse(body), purpose: body.purpose || 'LOGIN' }

    const reqCount = await incrementOtpRequest(noHp)
    if (reqCount > 3) return error('Terlalu banyak permintaan OTP. Coba lagi dalam 1 jam.', 429)

    const user = await db.user.findUnique({ where: { noHp } })
    if (!user) return error('Nomor HP tidak terdaftar.', 404)
    if (!user.isActive) return error('Akun tidak aktif.', 403)

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = await bcrypt.hash(otpCode, 8)
    await setOtp(noHp, otpHash)

    await db.otpCode.create({
      data: { userId: user.id, noHp, otpHash, purpose, expiresAt: new Date(Date.now()+5*60*1000) },
    })

    console.log(`[DEV] OTP ${purpose} for ${noHp}: ${otpCode}`)
    const devOtp = process.env.NODE_ENV === 'development' ? { _devOtp: otpCode } : {}

    return ok({ message: `Kode OTP dikirim via ${via==='wa'?'WhatsApp':'SMS'}.`, via, ...devOtp })
  } catch (err) { return handleError(err) }
}
