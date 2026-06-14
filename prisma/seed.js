const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // Cabang
  const cabangPusat = await prisma.cabang.upsert({
    where: { kode: 'PUSAT' },
    update: {},
    create: { nama: 'Kantor Pusat', kode: 'PUSAT', kota: 'Jakarta', alamat: 'Jl. Sudirman No.1', telepon: '021-12345678', email: 'pusat@gadaiku.com' },
  })
  const cabangBdg = await prisma.cabang.upsert({
    where: { kode: 'BDG01' },
    update: {},
    create: { nama: 'Cabang Bandung', kode: 'BDG01', kota: 'Bandung', alamat: 'Jl. Asia Afrika No.10' },
  })

  // Kategori
  const kategori = [
    { nama: 'Elektronik', deskripsi: 'HP, Laptop, Kamera, TV', persenMaks: 75 },
    { nama: 'Perhiasan', deskripsi: 'Emas, Berlian, Perak', persenMaks: 85 },
    { nama: 'Kendaraan', deskripsi: 'Motor, Mobil', persenMaks: 70 },
    { nama: 'Fashion Mewah', deskripsi: 'Tas branded, Jam tangan', persenMaks: 65 },
    { nama: 'Gadget & Game', deskripsi: 'Konsol game, Aksesoris', persenMaks: 60 },
    { nama: 'Alat Musik', deskripsi: 'Gitar, Piano, dll', persenMaks: 55 },
    { nama: 'Lainnya', deskripsi: 'Barang berharga lainnya', persenMaks: 50 },
  ]
  for (const k of kategori) {
    await prisma.kategoriBarang.upsert({ where: { nama: k.nama }, update: {}, create: k })
  }

  // Pengaturan
  const settings = [
    { kunci: 'NAMA_PERUSAHAAN', nilai: 'GadaiKu', grup: 'PERUSAHAAN', deskripsi: 'Nama perusahaan' },
    { kunci: 'TAGLINE', nilai: 'Gadai Cepat, Dana Cair Hari Ini', grup: 'PERUSAHAAN' },
    { kunci: 'ALAMAT', nilai: 'Jl. Sudirman No.1, Jakarta', grup: 'PERUSAHAAN' },
    { kunci: 'TELEPON_CS', nilai: '0800-4253-2458', grup: 'PERUSAHAAN' },
    { kunci: 'EMAIL_CS', nilai: 'cs@gadaiku.com', grup: 'PERUSAHAAN' },
    { kunci: 'WEBSITE', nilai: 'https://gadaiku.com', grup: 'PERUSAHAAN' },
    { kunci: 'BUNGA_DEFAULT', nilai: '1.5', grup: 'GADAI', deskripsi: 'Bunga default %/bulan' },
    { kunci: 'TENOR_DEFAULT', nilai: '30', grup: 'GADAI', deskripsi: 'Tenor default (hari)' },
    { kunci: 'TENOR_MAKS', nilai: '120', grup: 'GADAI' },
    { kunci: 'PERSEN_PINJAMAN', nilai: '75', grup: 'GADAI' },
    { kunci: 'BIAYA_ADMIN', nilai: '0', grup: 'GADAI', deskripsi: 'Biaya admin per transaksi' },
    { kunci: 'DENDA_HARIAN', nilai: '0.1', grup: 'GADAI', deskripsi: 'Denda %/hari keterlambatan' },
    { kunci: 'MIDTRANS_CLIENT_KEY', nilai: '', grup: 'PEMBAYARAN' },
    { kunci: 'MIDTRANS_SERVER_KEY', nilai: '', grup: 'PEMBAYARAN' },
    { kunci: 'MIDTRANS_IS_PRODUCTION', nilai: 'false', grup: 'PEMBAYARAN' },
    { kunci: 'WHATSAPP_TOKEN', nilai: '', grup: 'NOTIFIKASI' },
    { kunci: 'SMTP_HOST', nilai: 'smtp.gmail.com', grup: 'NOTIFIKASI' },
    { kunci: 'SMTP_PORT', nilai: '587', grup: 'NOTIFIKASI' },
    { kunci: 'INVOICE_PREFIX', nilai: 'INV', grup: 'INVOICE' },
    { kunci: 'INVOICE_FOOTER', nilai: 'Terima kasih telah mempercayakan GadaiKu', grup: 'INVOICE' },
    { kunci: 'OTP_EXPIRE', nilai: '300', grup: 'KEAMANAN', deskripsi: 'OTP expire dalam detik' },
    { kunci: 'LOGIN_ATTEMPT_LIMIT', nilai: '5', grup: 'KEAMANAN' },
    { kunci: 'SESSION_TIMEOUT', nilai: '86400', grup: 'KEAMANAN' },
    { kunci: 'TEMA_WARNA', nilai: 'blue', grup: 'TAMPILAN' },
    { kunci: 'DARK_MODE_DEFAULT', nilai: 'false', grup: 'TAMPILAN' },
  ]
  for (const s of settings) {
    await prisma.pengaturanSistem.upsert({ where: { kunci: s.kunci }, update: {}, create: s })
  }

  // Promo
  await prisma.promo.upsert({
    where: { kode: 'GADAI10' },
    update: {},
    create: {
      nama: 'Promo Bunga Hemat 10%',
      kode: 'GADAI10',
      deskripsi: 'Potongan bunga 10% untuk pengguna baru',
      tipe: 'POTONGAN_BUNGA',
      nilai: 10,
      minPinjaman: 500000,
      maxPenggunaan: 100,
      berlakuDari: new Date(),
      berlakuHingga: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  })

  // Users
  const hash = (p) => bcrypt.hash(p, 12)
  const [ownerPass, adminPass, supPass, petPass, nasabahPass] = await Promise.all([
    hash('Owner@123'), hash('Admin@123'), hash('Super@123'), hash('Petugas@123'), hash('Nasabah@123')
  ])

  const users = [
    { nama: 'Owner GadaiKu', nikHash: 'owner-hash', noHp: '08001111111', email: 'owner@gadaiku.com', passwordHash: ownerPass, role: 'OWNER', cabangId: cabangPusat.id },
    { nama: 'Super Admin', nikHash: 'admin-hash', noHp: '08002222222', email: 'admin@gadaiku.com', passwordHash: adminPass, role: 'ADMIN', cabangId: cabangPusat.id },
    { nama: 'Supervisor Pusat', nikHash: 'sup-hash', noHp: '08003333333', email: 'supervisor@gadaiku.com', passwordHash: supPass, role: 'SUPERVISOR', cabangId: cabangPusat.id },
    { nama: 'Petugas Pusat', nikHash: 'pet-hash', noHp: '08004444444', email: 'petugas@gadaiku.com', passwordHash: petPass, role: 'PETUGAS', cabangId: cabangPusat.id },
    { nama: 'Budi Wibowo', nikHash: 'nasabah-hash-budi', noHp: '081234567890', email: 'budi@email.com', passwordHash: nasabahPass, role: 'NASABAH', kota: 'Jakarta', referralCode: 'BUDI001' },
    { nama: 'Sari Dewi', nikHash: 'nasabah-hash-sari', noHp: '081234567891', email: 'sari@email.com', passwordHash: nasabahPass, role: 'NASABAH', kota: 'Bandung', referralCode: 'SARI001', cabangId: cabangBdg.id },
  ]
  for (const u of users) {
    await prisma.user.upsert({ where: { noHp: u.noHp }, update: {}, create: { ...u, isActive: true, isVerified: true } })
  }

  console.log('\n🎉 Seeding selesai!')
  console.log('────────────────────────────────────────────')
  console.log('👑 Owner  : owner@gadaiku.com    / Owner@123')
  console.log('🔧 Admin  : admin@gadaiku.com    / Admin@123')
  console.log('👁  Super  : supervisor@gadaiku.com / Super@123')
  console.log('👷 Petugas: petugas@gadaiku.com  / Petugas@123')
  console.log('👤 Nasabah: 081234567890          / Nasabah@123')
  console.log('────────────────────────────────────────────')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
