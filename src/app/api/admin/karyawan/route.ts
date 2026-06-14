import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const karyawan = await db.user.findMany({
      where: { role: { in: ['PETUGAS','SUPERVISOR','ADMIN'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id:true, nama:true, noHp:true, email:true, role:true, isActive:true, isVerified:true, createdAt:true,
        cabang: { select: { nama:true, kode:true } },
      },
    })
    return ok({ karyawan })
  } catch (err) { return handleError(err) }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const bcrypt = await import('bcryptjs')
    const crypto = await import('crypto')
    const passwordHash = await bcrypt.hash(body.password || 'GadaiKu@123', 12)
    const nikHash = crypto.createHash('sha256').update(body.nik || body.noHp).digest('hex')

    const user = await db.user.create({
      data: {
        nama: body.nama, nikHash, noHp: body.noHp, email: body.email || null,
        passwordHash, role: body.role || 'PETUGAS', cabangId: body.cabangId || null,
        isActive: true, isVerified: true,
      },
    })
    return ok({ user })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    if (!body.id) return error('ID karyawan diperlukan.', 400)

    const updates: any = {}
    if (typeof body.role === 'string') updates.role = body.role
    if (typeof body.isActive === 'boolean') updates.isActive = body.isActive
    if (typeof body.password === 'string' && body.password.trim()) {
      const bcrypt = await import('bcryptjs')
      updates.passwordHash = await bcrypt.hash(body.password, 12)
    }

    if (!Object.keys(updates).length) return error('Tidak ada perubahan.', 400)

    const user = await db.user.update({
      where: { id: body.id },
      data: updates,
      select: {
        id:true, nama:true, noHp:true, email:true, role:true, isActive:true, isVerified:true, createdAt:true,
        cabang: { select: { nama:true, kode:true } },
      },
    })

    return ok({ user })
  } catch (err) { return handleError(err) }
}
