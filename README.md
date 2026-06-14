# GadaiKu — Aplikasi Gadai Digital Premium v2.0

Platform gadai digital modern, aman, dan lengkap untuk perusahaan gadai profesional.

---

## 📋 Daftar Fitur Lengkap

### 🔐 Autentikasi & Keamanan
- Login email/HP + password
- Login OTP via SMS / WhatsApp
- Register + verifikasi OTP
- Lupa password + reset via OTP
- JWT access token (15 menit) + refresh token (7 hari)
- Session management dengan httpOnly cookie
- Rate limiting & brute-force protection (Redis)
- Role-based access control (5 role)
- Audit log semua aktivitas

### 👥 Role System
| Role | Akses |
|---|---|
| **NASABAH** | Dashboard, ajukan gadai, bayar, riwayat, invoice |
| **PETUGAS** | Verifikasi gadai, penilaian barang, update status |
| **SUPERVISOR** | Approve pengajuan, revisi, monitoring |
| **ADMIN** | Full management + laporan + pengaturan |
| **OWNER** | Business overview, laporan keuangan, monitoring |

### 📦 Modul Gadai
- Multi-step form pengajuan (kategori, barang, estimasi, konfirmasi)
- Upload foto barang
- 11 status gadai (Menunggu → Ditaksir → Disetujui → Aktif → Lunas/Lelang)
- Tracking timeline status
- Kalkulasi bunga otomatis
- Perpanjangan tenor
- Denda keterlambatan otomatis
- QR Code per barang

### 💳 Sistem Pembayaran
- Midtrans Snap & Core API
- Virtual Account (BCA, Mandiri, BNI, BRI)
- QRIS
- E-Wallet (GoPay, OVO, DANA)
- Kartu Kredit/Debit
- Verifikasi callback otomatis
- Verifikasi manual oleh admin
- Status: Pending → Success / Failed / Expired

### 📄 Invoice & Dokumen
- Generate invoice otomatis setelah pembayaran
- Nomor invoice unik
- Template HTML profesional dengan logo
- Download & cetak PDF (via browser print)
- Kirim via WhatsApp & Email
- Dukungan printer thermal & A4

### 📊 Dashboard & Laporan
- Dashboard nasabah: ringkasan, gadai aktif, notifikasi
- Dashboard admin: statistik real-time, tabel terbaru
- Dashboard owner: business overview, P&L, growth
- Laporan bulanan: bar chart, area chart, pie chart, line chart
- Export CSV
- Filter 3/6/12 bulan

### 🏢 Multi Cabang
- CRUD cabang
- Statistik per cabang
- Assign karyawan ke cabang

### 🔔 Notifikasi
- Notifikasi in-app real-time
- WhatsApp via Fonnte API
- Email via SMTP
- Blast massal (per role / semua)
- Reminder otomatis: H-7, H-3, H-1, hari H, terlambat
- Tipe: Jatuh tempo, Pembayaran, Status gadai, Promo, Sistem

### 🎁 Promo & Referral
- Buat & kelola kode voucher/promo
- Tipe: potongan bunga %, cashback Rp, biaya admin gratis
- Batas penggunaan & tanggal berlaku
- Program referral: kode unik per nasabah
- Bonus referrer + referred

### ⭐ Feedback & Rating
- Rating 1-5 bintang
- Kategori feedback
- Komentar teks
- Riwayat feedback nasabah

### 🔧 Pengaturan Sistem
- Konfigurasi bunga default
- Tenor min/max
- Persentase pinjaman
- Denda harian
- Info perusahaan
- Gateway payment keys
- Format nomor invoice

---

## 🗂️ Struktur Project

```
gadai-app/
├── prisma/
│   ├── schema.prisma        # 20+ tabel database
│   └── seed.js              # Data awal semua role
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Register, OTP, Lupa Password
│   │   ├── (dashboard)/     # Semua halaman nasabah
│   │   ├── (admin)/         # Panel admin & petugas
│   │   ├── (owner)/         # Dashboard khusus owner
│   │   └── api/             # 25+ API routes
│   ├── components/ui/       # Komponen reusable
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities & helpers
│   │   ├── db.ts            # Prisma client
│   │   ├── redis.ts         # Redis + OTP helpers
│   │   ├── jwt.ts           # Token management
│   │   ├── auth.ts          # Auth middleware
│   │   ├── api.ts           # Response helpers
│   │   ├── utils.ts         # Format & kalkulasi
│   │   ├── validations.ts   # Zod schemas
│   │   ├── invoice.ts       # Generate invoice HTML
│   │   ├── audit.ts         # Audit log helper
│   │   └── notification.ts  # WA/Email/notif helper
│   ├── types/index.ts       # TypeScript types
│   └── middleware.ts        # Route protection
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Cara Setup & Jalankan

### 1. Install Node.js
Download dari **https://nodejs.org** → pilih LTS → install → restart PC

### 2. Extract & buka project
```bash
cd gadai-app
```

### 3. Install dependencies
```bash
npm install
```

### 4. Setup environment
```bash
cp .env.example .env.local
# Edit .env.local, isi DATABASE_URL, REDIS_URL, JWT secrets
```

### 5. Setup database
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Buat semua tabel
npm run db:seed        # Isi data awal
```

### 6. Jalankan
```bash
npm run dev
# Buka http://localhost:3000
```

---

## 🔑 Akun Bawaan

| Role | Login | Password |
|---|---|---|
| 👑 Owner | `owner@gadaiku.com` | `Owner@123` |
| 🔧 Admin | `admin@gadaiku.com` | `Admin@123` |
| 👁 Supervisor | `supervisor@gadaiku.com` | `Super@123` |
| 👷 Petugas | `petugas@gadaiku.com` | `Petugas@123` |
| 👤 Nasabah | HP: `081234567890` | `Nasabah@123` |

---

## 🌐 Deploy ke Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Environment variables wajib di Vercel:
- `DATABASE_URL` (dari Neon.tech)
- `REDIS_URL` (dari Upstash.com)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

---

## 🗄️ Database (20+ tabel)

```
User, RefreshToken, OtpCode, LoginLog, Rekening,
Cabang, KategoriBarang, BarangGadai, FotoBarang, PenilaianBarang,
DokumenUser, Gadai, RiwayatStatusGadai, Denda,
Pembayaran, Invoice, InvoiceItem, Notifikasi,
Promo, Referral, Feedback, AuditLog, PengaturanSistem
```

---

## 📡 API Routes (30+)

### Auth
- `POST /api/auth/register` — Daftar nasabah
- `POST /api/auth/login` — Login password
- `POST /api/auth/otp/kirim` — Kirim OTP
- `POST /api/auth/otp/verifikasi` — Verifikasi OTP
- `POST /api/auth/logout` — Logout
- `POST /api/auth/refresh` — Refresh token
- `POST /api/auth/reset-password` — Reset password

### Gadai
- `GET/POST /api/gadai/baru` — List & ajukan gadai
- `GET /api/gadai/[id]/detail` — Detail gadai
- `PATCH /api/gadai/[id]/status` — Update status (admin)

### Pembayaran
- `POST /api/pembayaran/buat` — Buat pembayaran
- `POST /api/pembayaran/callback` — Webhook Midtrans
- `GET /api/admin/pembayaran` — Monitor pembayaran
- `PATCH /api/admin/pembayaran/[id]/verifikasi` — Verif manual

### Invoice
- `POST /api/invoice/generate` — Generate invoice
- `GET /api/invoice/list` — List invoice
- `GET /api/invoice/[id]/download` — Download invoice

### Admin
- `GET /api/admin/dashboard` — Statistik dashboard
- `GET /api/admin/gadai` — Semua gadai
- `GET /api/admin/nasabah` — Data nasabah
- `GET /api/admin/barang` — Barang gadai
- `GET/POST/PATCH /api/admin/cabang` — CRUD cabang
- `GET/POST/PATCH /api/admin/kategori` — CRUD kategori
- `GET/POST/PATCH /api/admin/promo` — CRUD promo
- `GET/PATCH /api/admin/pengaturan` — Pengaturan sistem
- `GET /api/admin/laporan` — Laporan keuangan
- `GET /api/admin/audit-log` — Audit log
- `POST /api/admin/notifikasi-blast` — Blast notifikasi
- `GET/POST /api/admin/karyawan` — Data karyawan

### Lainnya
- `GET/PATCH /api/profil` — Profil nasabah
- `PATCH /api/profil/password` — Ubah password
- `GET/PATCH /api/notifikasi` — Notifikasi
- `GET/PATCH /api/denda` — Denda otomatis
- `GET/POST /api/feedback` — Feedback nasabah
- `GET /api/referral` — Program referral
