import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { ubahPasswordSchema } from '@/lib/validations'
import { getPasswordPolicy, validatePasswordPolicy } from '@/lib/password-policy'

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const data = ubahPasswordSchema.parse(body)

    const user = await db.user.findUnique({ where: { id: auth.userId } })
    if (!user || !user.passwordHash) return error('Akun tidak memiliki password.', 400)

    const valid = await bcrypt.compare(data.passwordLama, user.passwordHash)
    if (!valid) return error('Password lama tidak sesuai.', 401)

    const policy = await getPasswordPolicy()
    const policyError = validatePasswordPolicy(data.passwordBaru, policy)
    if (policyError) return error(policyError, 422)

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const passwordHash = await bcrypt.hash(data.passwordBaru, rounds)
    await db.user.update({ where: { id: auth.userId }, data: { passwordHash } })
    await db.refreshToken.updateMany({ where: { userId: auth.userId }, data: { isRevoked: true } })

    return ok({ message: 'Password berhasil diubah.' })
  } catch (err) { return handleError(err) }
}
