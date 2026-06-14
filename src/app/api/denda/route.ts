// src/app/api/denda/route.ts
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'

// GET - list denda milik nasabah atau semua (admin)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const isStaff = ['PETUGAS', 'SUPERVISOR', 'ADMIN', 'OWNER'].includes(auth.role)

    const denda = await db.denda.findMany({
      where: isStaff ? {} : {
        gadai: { userId: auth.userId },
      },
      include: {
        gadai: {
          select: {
            nomorGadai: true,
            user: { select: { nama: true, noHp: true } },
            barang: { select: { nama: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return ok({ denda })
  } catch (err) { return handleError(err) }
}

// POST - hitung denda untuk gadai yang jatuh tempo (cron job / manual)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!['PETUGAS', 'SUPERVISOR', 'ADMIN', 'OWNER'].includes(auth.role)) {
      return ok({ message: 'Akses ditolak' })
    }

    // Ambil semua gadai yang jatuh tempo dan belum ditebus
    const gadaiJatuhTempo = await db.gadai.findMany({
      where: {
        status: { in: ['AKTIF', 'JATUH_TEMPO'] },
        tanggalJatuhTempo: { lt: new Date() },
      },
    })

    // Ambil setting denda
    const dendaSetting = await db.pengaturanSistem.findUnique({ where: { kunci: 'DENDA_HARIAN' } })
    const persenDenda = parseFloat(dendaSetting?.nilai || '0.1')

    let count = 0
    for (const gadai of gadaiJatuhTempo) {
      const hariTerlambat = Math.floor((Date.now() - new Date(gadai.tanggalJatuhTempo!).getTime()) / (1000 * 60 * 60 * 24))
      if (hariTerlambat <= 0) continue

      const jumlahDenda = Math.round(gadai.jumlahPinjaman * (persenDenda / 100) * hariTerlambat)

      // Cek apakah denda hari ini sudah ada
      const existing = await db.denda.findFirst({
        where: {
          gadaiId: gadai.id,
          createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
        },
      })
      if (existing) continue

      await db.denda.create({
        data: {
          gadaiId: gadai.id,
          jumlah: jumlahDenda,
          hariTerlambat,
          persenDenda,
        },
      })

      // Update total denda di gadai
      await db.gadai.update({
        where: { id: gadai.id },
        data: {
          status: 'JATUH_TEMPO',
          totalDenda: { increment: jumlahDenda },
          sisaTagihan: { increment: jumlahDenda },
        },
      })

      count++
    }

    return ok({ message: `${count} denda berhasil dihitung`, count })
  } catch (err) { return handleError(err) }
}
