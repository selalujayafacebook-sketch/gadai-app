// src/lib/audit.ts
import { db } from './db'
import { NextRequest } from 'next/server'

export async function createAuditLog({
  userId, aksi, modul, targetId, detail, req,
}: {
  userId?: string
  aksi: string
  modul: string
  targetId?: string
  detail?: string
  req?: NextRequest
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: userId || null,
        aksi,
        modul,
        targetId: targetId || null,
        detail: detail || null,
        ipAddress: req?.headers.get('x-forwarded-for') || req?.ip || null,
        userAgent: req?.headers.get('user-agent') || null,
      },
    })
  } catch { /* non-blocking */ }
}
