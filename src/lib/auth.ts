import { NextRequest } from 'next/server'
import { verifyAccess, JwtPayload } from './jwt'
import { AppError } from './api'
import { db } from './db'
import { AuditLog } from '@prisma/client'

export async function getAuthUser(req: NextRequest): Promise<JwtPayload> {
  const token = req.cookies.get('access_token')?.value || req.headers.get('authorization')?.replace('Bearer ','')
  if (!token) throw new AppError('Token tidak ditemukan.', 401, 'UNAUTHORIZED')
  try { return await verifyAccess(token) }
  catch { throw new AppError('Token tidak valid.', 401, 'TOKEN_EXPIRED') }
}

export async function requireAuth(req: NextRequest) {
  const u = await getAuthUser(req)
  const dbUser = await db.user.findUnique({ where: { id: u.userId } })
  if (!dbUser?.isActive) throw new AppError('Akun tidak aktif.', 401, 'UNAUTHORIZED')
  return u
}

const staffRoles = ['PETUGAS','SUPERVISOR','ADMIN','OWNER']
const adminRoles = ['ADMIN','OWNER']

export const requireStaff      = async (req: NextRequest) => { const u=await requireAuth(req); if(!staffRoles.includes(u.role)) throw new AppError('Akses ditolak.',403,'FORBIDDEN'); return u }
export const requireSupervisor = async (req: NextRequest) => { const u=await requireAuth(req); if(!['SUPERVISOR','ADMIN','OWNER'].includes(u.role)) throw new AppError('Akses ditolak.',403,'FORBIDDEN'); return u }
export const requireAdmin      = async (req: NextRequest) => { const u=await requireAuth(req); if(!adminRoles.includes(u.role)) throw new AppError('Akses ditolak.',403,'FORBIDDEN'); return u }
export const requireOwner      = async (req: NextRequest) => { const u=await requireAuth(req); if(u.role!=='OWNER') throw new AppError('Akses Owner only.',403,'FORBIDDEN'); return u }

// Compatibility alias: some routes expect `requirePetugas`
export const requirePetugas = requireStaff

export async function auditLog(userId: string|null, aksi: string, modul: string, targetId?: string, detail?: any, req?: NextRequest) {
  try {
    await db.auditLog.create({
      data: { userId, aksi, modul, targetId, detail, ipAddress: req?.headers.get('x-forwarded-for') || null, userAgent: req?.headers.get('user-agent') || null }
    })
  } catch {}
}
