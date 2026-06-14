import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { created, error, handleError } from '@/lib/api'
import { registerSchema } from '@/lib/validations'
import { setOtp, incrementOtpRequest } from '@/lib/redis'
import { getPasswordPolicy, validatePasswordPolicy } from '@/lib/password-policy'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const policy = await getPasswordPolicy()
    const policyError = validatePasswordPolicy(data.password, policy)
    if (policyError) return error(policyError, 422)

    const existingHp = await db.user.findUnique({ where: { noHp: data.noHp } })
    if (existingHp) return error('Nomor HP sudah terdaftar.', 409)

    if (data.email) {
      const existingEmail = await db.user.findUnique({ where: { email: data.email } })
      if (existingEmail) return error('Email sudah terdaftar.', 409)
    }

    const nikHash = crypto.createHash('sha256').update(data.nik).digest('hex')
    const existingNik = await db.user.findFirst({ where: { nikHash } })
    if (existingNik) return error('NIK sudah terdaftar.', 409)

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const passwordHash = await bcrypt.hash(data.password, rounds)
    const referralCode = (data.nama.slice(0,4).toUpperCase().replace(/[^A-Z]/g,'') + Math.floor(100+Math.random()*900))

    const user = await db.user.create({
      data: {
        nama: data.nama, nikHash, noHp: data.noHp, email: data.email || null,
        passwordHash, alamat: data.alamat || null, kota: data.kota || null,
        isVerified: false, isActive: true, referralCode,
      },
      select: { id: true, nama: true, noHp: true, email: true },
    })

    const reqCount = await incrementOtpRequest(data.noHp)
    if (reqCount > 3) return error('Terlalu banyak permintaan OTP. Coba lagi dalam 1 jam.', 429)

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = await bcrypt.hash(otpCode, 8)
    await setOtp(data.noHp, otpHash)

    await db.otpCode.create({
      data: { userId: user.id, noHp: data.noHp, otpHash, purpose: 'REGISTER', expiresAt: new Date(Date.now()+5*60*1000) },
    })

    console.log(`[DEV] OTP REGISTER for ${data.noHp}: ${otpCode}`)
    const devOtp = process.env.NODE_ENV === 'development' ? { _devOtp: otpCode } : {}

    return created({ user, message: 'Kode OTP dikirim ke nomor HP Anda.', ...devOtp })
  } catch (err) { return handleError(err) }
}
