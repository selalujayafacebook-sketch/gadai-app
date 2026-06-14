import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

export const formatRupiah = (n: number, short = false) => {
  if (short) {
    if (n >= 1_000_000_000) return `Rp ${(n/1_000_000_000).toFixed(1).replace('.0','')} M`
    if (n >= 1_000_000)     return `Rp ${(n/1_000_000).toFixed(1).replace('.0','')} jt`
    if (n >= 1_000)         return `Rp ${(n/1_000).toFixed(0)} rb`
  }
  return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n)
}

export const formatDate     = (d: Date|string, fmt='dd MMM yyyy') => format(new Date(d), fmt, { locale:id })
export const formatDateTime = (d: Date|string) => format(new Date(d), 'dd MMM yyyy, HH:mm', { locale:id })
export const formatRelative = (d: Date|string) => formatDistanceToNow(new Date(d), { addSuffix:true, locale:id })
export const sisaHari       = (jt: Date|string) => differenceInDays(new Date(jt), new Date())

export function hitungBunga({ jumlahPinjaman, bungaPerBulan, tenor }: { jumlahPinjaman:number; bungaPerBulan:number; tenor:number }) {
  const bungaPerHari = (bungaPerBulan / 100) / 30
  const totalBunga   = Math.round(jumlahPinjaman * bungaPerHari * tenor)
  return { totalBunga, totalBayar: jumlahPinjaman + totalBunga }
}

export function hitungDenda({ jumlahPinjaman, bungaPerBulan, hariTelat, persenDenda = 0.1 }: { jumlahPinjaman:number; bungaPerBulan:number; hariTelat:number; persenDenda?:number }) {
  return Math.round(jumlahPinjaman * (persenDenda / 100) * hariTelat)
}

export function generateNomor(prefix: string) {
  const y = new Date().getFullYear()
  const m = String(new Date().getMonth()+1).padStart(2,'0')
  const r = String(Math.floor(Math.random()*10000)).padStart(4,'0')
  return `${prefix}-${y}${m}-${r}`
}

export const maskHp  = (hp: string) => hp.slice(0,4)+'-xxxx-'+hp.slice(-4)
export const maskPhone = maskHp
export const maskNIK = (n: string)  => n.slice(0,4)+'****'+n.slice(-4)

// Convenience wrappers for domain-specific numbers
export const generateNomorGadai = () => generateNomor('GAD')
export const generateNomorPembayaran = () => generateNomor('PAY')

export const STATUS_LABEL: Record<string,string> = {
  MENUNGGU_VERIFIKASI:'Menunggu Verifikasi', DITAKSIR:'Ditaksir', DISETUJUI:'Disetujui',
  DITOLAK:'Ditolak', MENUNGGU_PEMBAYARAN:'Menunggu Pembayaran', AKTIF:'Aktif',
  JATUH_TEMPO:'Jatuh Tempo', DIPERPANJANG:'Diperpanjang', LUNAS:'Lunas', LELANG:'Lelang',
}

export const STATUS_COLOR: Record<string,string> = {
  MENUNGGU_VERIFIKASI:'badge-menunggu', DITAKSIR:'badge-diproses',
  DISETUJUI:'badge-diproses', DITOLAK:'badge-ditolak',
  MENUNGGU_PEMBAYARAN:'badge-menunggu', AKTIF:'badge-aktif',
  JATUH_TEMPO:'badge-jatuh', DIPERPANJANG:'badge-diproses',
  LUNAS:'badge-lunas', LELANG:'badge-lelang',
}
