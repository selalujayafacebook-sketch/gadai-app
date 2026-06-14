import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { ok, created, handleError } from '@/lib/api'
import { requireAuth } from '@/lib/auth'
import { ajukanGadaiSchema } from '@/lib/validations'
import { generateNomorGadai, hitungBunga } from '@/lib/utils'

// POST /api/gadai/baru — Nasabah ajukan gadai baru
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const body = await req.json()
    const data = ajukanGadaiSchema.parse(body)

    const bungaSetting = await db.pengaturanSistem.findUnique({ where: { kunci: 'BUNGA_DEFAULT' } })
    const persenSetting = await db.pengaturanSistem.findUnique({ where: { kunci: 'PERSEN_PINJAMAN' } })

    const bungaPerBulan = parseFloat(bungaSetting?.nilai || '1.5')
    const persenPinjaman = parseFloat(persenSetting?.nilai || '75') / 100
    const jumlahPinjaman = Math.round(data.nilaiTaksiran * persenPinjaman)

    const { totalBunga, totalBayar } = hitungBunga({ jumlahPinjaman, bungaPerBulan, tenor: data.tenor })

    const jatuhTempo = new Date()
    jatuhTempo.setDate(jatuhTempo.getDate() + data.tenor)

    const nomorGadai = generateNomorGadai()

    const gadai = await db.gadai.create({
      data: {
        nomorGadai, userId: user.userId, status: 'MENUNGGU_VERIFIKASI',
        nilaiTaksiran: data.nilaiTaksiran, jumlahPinjaman, bungaPerBulan, tenor: data.tenor,
        totalBunga, totalBayar, sisaTagihan: totalBayar, tanggalJatuhTempo: jatuhTempo,
        catatan: data.catatan || null,
        barang: {
          create: {
            kategoriId: data.kategoriId, nama: data.namaBarang, merk: data.merk || null,
            model: data.model || null, tahun: data.tahun || null, kondisi: data.kondisi,
            deskripsi: data.deskripsi || null, nilaiTaksiran: data.nilaiTaksiran,
          },
        },
        riwayatStatus: {
          create: { statusBaru: 'MENUNGGU_VERIFIKASI', catatan: 'Pengajuan gadai baru dari nasabah.', changedBy: user.userId },
        },
      },
      include: { barang: true },
    })

    await db.notifikasi.create({
      data: {
        userId: user.userId, gadaiId: gadai.id, judul: 'Pengajuan gadai diterima',
        pesan: `Pengajuan gadai ${nomorGadai} sedang menunggu verifikasi petugas.`, tipe: 'STATUS_GADAI',
      },
    })

    return created({ gadai })
  } catch (err) { return handleError(err) }
}

// GET /api/gadai/baru — List gadai milik nasabah
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where = { userId: user.userId, ...(status ? { status: status as never } : {}) }

    const [gadai, total] = await Promise.all([
      db.gadai.findMany({
        where, include: { barang: { include: { kategori: true, foto: { take: 1 } } } },
        orderBy: { createdAt: 'desc' }, skip: (page-1)*limit, take: limit,
      }),
      db.gadai.count({ where }),
    ])

    return ok({ gadai, pagination: { page, limit, total, pages: Math.ceil(total/limit) } })
  } catch (err) { return handleError(err) }
}
