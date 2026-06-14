import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { getPasswordPolicy, validatePasswordPolicy } from '@/lib/password-policy'

export async function POST(req: NextRequest) {
  try {
    const { noHp, password } = await req.json()
    if (!noHp || !password) return error('Data tidak lengkap.')

    const policy = await getPasswordPolicy()
    const policyError = validatePasswordPolicy(password, policy)
    if (policyError) return error(policyError, 422)

    const user = await db.user.findUnique({ where: { noHp } })
    if (!user) return error('Nomor HP tidak ditemukan.', 404)

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const passwordHash = await bcrypt.hash(password, rounds)

    await db.user.update({ where: { id: user.id }, data: { passwordHash } })
    await db.refreshToken.updateMany({ where: { userId: user.id }, data: { isRevoked: true } })

    return ok({ message: 'Password berhasil diubah. Silakan login kembali.' })
  } catch (err) { return handleError(err) }
}
