import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { updateProfilSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { id:true, nama:true, noHp:true, email:true, role:true, isVerified:true, avatar:true, alamat:true, kota:true, referralCode:true, createdAt:true },
    })
    return ok({ user })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const data = updateProfilSchema.parse(body)
    const user = await db.user.update({
      where: { id: auth.userId },
      data: { nama: data.nama, email: data.email || null, alamat: data.alamat, kota: data.kota },
      select: { id:true, nama:true, noHp:true, email:true, alamat:true, kota:true },
    })
    return ok({ user })
  } catch (err) { return handleError(err) }
}
