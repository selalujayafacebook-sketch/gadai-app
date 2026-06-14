// src/lib/notification.ts
import { db } from './db'

// ─── Template pesan ────────────────────────────────────────
export const templates = {
  otpLogin: (kode: string, nama: string) =>
    `Halo ${nama},\nKode OTP GadaiKu Anda: *${kode}*\nBerlaku 5 menit. Jangan bagikan kode ini ke siapapun.`,

  gadaiDisetujui: (nomor: string, jumlah: string) =>
    `✅ Gadai Anda *${nomor}* telah *DISETUJUI*!\nJumlah pinjaman: *${jumlah}*\nDana akan segera ditransfer. Terima kasih telah memilih GadaiKu.`,

  gadaiDitolak: (nomor: string, alasan?: string) =>
    `❌ Gadai *${nomor}* tidak dapat kami proses.\n${alasan ? `Alasan: ${alasan}\n` : ''}Hubungi CS kami untuk info lebih lanjut.`,

  reminderJatuhTempo: (nomor: string, tanggal: string, hari: number) =>
    `⚠️ Pengingat GadaiKu\nGadai *${nomor}* akan jatuh tempo pada *${tanggal}* (${hari} hari lagi).\nSegera lakukan pelunasan atau perpanjangan. Akses: https://gadaiku.com/gadai`,

  pembayaranSukses: (nomor: string, jumlah: string, metode: string) =>
    `✅ Pembayaran Berhasil!\nNo. Gadai: *${nomor}*\nJumlah: *${jumlah}*\nMetode: ${metode}\nTerima kasih telah melakukan pembayaran.`,

  invoiceKirim: (nomor: string, link: string) =>
    `📄 Invoice GadaiKu\nNo. Invoice: *${nomor}*\nUnduh invoice Anda di: ${link}`,
}

// ─── Kirim notifikasi ke database ─────────────────────────
export async function createNotifikasi({
  userId, gadaiId, judul, pesan, tipe = 'SISTEM',
}: {
  userId: string
  gadaiId?: string
  judul: string
  pesan: string
  tipe?: string
}) {
  return db.notifikasi.create({
    data: {
      userId,
      gadaiId: gadaiId || null,
      judul,
      pesan,
      tipe: tipe as never,
    },
  })
}

// ─── Kirim WhatsApp via Fonnte (real integration) ─────────
export async function sendWhatsApp(noHp: string, pesan: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN
  if (!token) {
    console.log(`[WA DEV] To: ${noHp}\nMsg: ${pesan}`)
    return true
  }
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams({ target: noHp, message: pesan }),
    })
    const json = await res.json()
    return json.status === true
  } catch {
    return false
  }
}

// ─── Kirim email via SMTP ─────────────────────────────────
export async function sendEmail({ to, subject, html }: {
  to: string; subject: string; html: string
}): Promise<boolean> {
  // Implementasi dengan nodemailer atau Resend
  console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`)
  return true
}

// ─── Blast notifikasi ke banyak user ─────────────────────
export async function blastNotifikasi({
  userIds, judul, pesan, tipe = 'SISTEM', channel = 'APP',
}: {
  userIds: string[]
  judul: string
  pesan: string
  tipe?: string
  channel?: string
}) {
  const data = userIds.map(userId => ({
    userId,
    judul,
    pesan,
    tipe: tipe as never,
    channel,
  }))
  return db.notifikasi.createMany({ data })
}
