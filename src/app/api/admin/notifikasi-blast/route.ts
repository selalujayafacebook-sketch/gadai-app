// src/app/api/admin/notifikasi-blast/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { blastNotifikasi, sendWhatsApp } from '@/lib/notification'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { judul, pesan, tipe = 'PROMO', channel = 'APP', target = 'ALL', role } = await req.json()

    // Ambil target users
    const users = await db.user.findMany({
      where: {
        isActive: true,
        ...(target === 'ROLE' && role ? { role } : { role: 'NASABAH' }),
      },
      select: { id: true, noHp: true, email: true },
    })

    const userIds = users.map(u => u.id)

    // Blast ke DB
    await blastNotifikasi({ userIds, judul, pesan, tipe, channel })

    // Blast WA jika diminta
    if (channel === 'WHATSAPP' || channel === 'ALL') {
      let sent = 0
      for (const u of users) {
        const ok = await sendWhatsApp(u.noHp, `*${judul}*\n\n${pesan}`)
        if (ok) sent++
      }
      return ok({ message: `Blast selesai. ${sent}/${users.length} WA terkirim.`, total: users.length })
    }

    return ok({ message: `Notifikasi dikirim ke ${userIds.length} pengguna.`, total: userIds.length })
  } catch (err) { return handleError(err) }
}
