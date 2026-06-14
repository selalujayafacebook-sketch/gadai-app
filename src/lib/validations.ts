import { z } from 'zod'

export const loginSchema = z.object({ identifier: z.string().min(1, 'Required'), password: z.string().min(6) })

export const loginOtpSchema = z.object({ noHp: z.string().min(5), via: z.enum(['sms','wa']).optional(), purpose: z.string().optional() })

export const verifyOtpSchema = z.object({ noHp: z.string().min(5), kode: z.string().min(4), purpose: z.string().optional() })

export const registerSchema = z.object({
  nama: z.string().min(1), noHp: z.string().min(5), password: z.string().min(8), nik: z.string().min(8),
  email: z.string().email().optional(), alamat: z.string().optional(), kota: z.string().optional(),
})

export const updateProfilSchema = z.object({ nama: z.string().min(1).optional(), email: z.string().email().optional(), alamat: z.string().optional(), kota: z.string().optional() })

export const ubahPasswordSchema = z.object({ passwordLama: z.string().min(6), passwordBaru: z.string().min(8), confirmPassword: z.string().min(8) })

export const ajukanGadaiSchema = z.object({
  kategoriId: z.string().min(1), namaBarang: z.string().min(1), merk: z.string().optional(), model: z.string().optional(), tahun: z.number().optional(),
  kondisi: z.string().min(1), deskripsi: z.string().optional(), nilaiTaksiran: z.number().min(0), tenor: z.number().min(7), catatan: z.string().optional(),
})

export const updateStatusGadaiSchema = z.object({ status: z.string().min(1), jumlahPinjaman: z.number().optional(), bungaPerBulan: z.number().optional(), catatanPetugas: z.string().optional() })

export const buatPembayaranSchema = z.object({ gadaiId: z.string().min(1), jenis: z.enum(['PELUNASAN','PERPANJANGAN']), metodePembayaran: z.string().min(1), tenorBaru: z.number().optional(), kodePromo: z.string().optional() })

// re-export names expected elsewhere
export { loginSchema as defaultLoginSchema }