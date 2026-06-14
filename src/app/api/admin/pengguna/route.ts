import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { db } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

const STAFF_ROLES: Role[] = ['PETUGAS', 'SUPERVISOR', 'ADMIN']
const VALID_ROLES: Role[] = ['NASABAH', 'PETUGAS', 'SUPERVISOR', 'ADMIN', 'OWNER']

function parsePasswordPolicy(settings: { kunci: string; nilai: string }[]) {
  const find = (key: string) => settings.find(s => s.kunci === key)?.nilai
  return {
    minLength: Number(find('PASSWORD_MIN_LENGTH') ?? 8),
    requireUppercase: find('PASSWORD_REQUIRE_UPPERCASE') === 'true',
    requireNumber: find('PASSWORD_REQUIRE_NUMBER') === 'true',
    requireSymbol: find('PASSWORD_REQUIRE_SYMBOL') === 'true',
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const [nasabah, karyawan, settings, pinjamanSum] = await Promise.all([
      db.user.findMany({
        where: { role: 'NASABAH' },
        orderBy: { createdAt: 'desc' },
        select: { id:true, nama:true, noHp:true, email:true, role:true, isActive:true, isVerified:true, createdAt:true, cabang:true },
      }),
      db.user.findMany({
        where: { role: { in: STAFF_ROLES } },
        orderBy: { createdAt: 'desc' },
        select: { id:true, nama:true, noHp:true, email:true, role:true, isActive:true, isVerified:true, createdAt:true, cabang:true },
      }),
      db.pengaturanSistem.findMany({ where: { kunci: { in: ['PASSWORD_MIN_LENGTH', 'PASSWORD_REQUIRE_UPPERCASE', 'PASSWORD_REQUIRE_NUMBER', 'PASSWORD_REQUIRE_SYMBOL'] } } }),
      db.gadai.aggregate({
        where: { status: { in: ['AKTIF','MENUNGGU_PEMBAYARAN','JATUH_TEMPO','DIPERPANJANG'] } },
        _sum: { jumlahPinjaman: true },
      }),
    ])

    return ok({
      nasabah,
      karyawan,
      counts: {
        totalNasabah: nasabah.length,
        totalKaryawan: karyawan.length,
        totalPinjamanAktif: pinjamanSum._sum.jumlahPinjaman ?? 0,
      },
      policy: parsePasswordPolicy(settings),
    })
  } catch (err) { return handleError(err) }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    if (!body.id) return error('ID pengguna diperlukan.', 400)

    const updates: any = {}
    if (typeof body.isActive === 'boolean') updates.isActive = body.isActive
    if (typeof body.role === 'string') {
      if (!VALID_ROLES.includes(body.role)) return error('Role tidak valid.', 400)
      updates.role = body.role
    }
    if (typeof body.password === 'string' && body.password.trim()) {
      updates.passwordHash = await bcrypt.hash(body.password, 12)
    }

    if (!Object.keys(updates).length) return error('Tidak ada perubahan untuk disimpan.', 400)

    const user = await db.user.update({
      where: { id: body.id },
      data: updates,
      select: { id:true, nama:true, noHp:true, email:true, role:true, isActive:true, isVerified:true, createdAt:true, cabang:true },
    })

    return ok({ user })
  } catch (err) { return handleError(err) }
}
