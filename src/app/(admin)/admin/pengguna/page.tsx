'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowUpRight, CheckCircle2, Key, Loader2, RefreshCcw, Search, Shield, Users, UserPlus, XCircle } from 'lucide-react'
import { cn, formatRupiah, formatDate } from '@/lib/utils'

const TAB_ITEMS = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'nasabah', label: 'Nasabah' },
  { id: 'karyawan', label: 'Karyawan' },
  { id: 'password', label: 'Kebijakan Password' },
] as const

type TabId = typeof TAB_ITEMS[number]['id']

type PasswordPolicy = {
  minLength: number
  requireUppercase: boolean
  requireNumber: boolean
  requireSymbol: boolean
}

type UserItem = {
  id: string
  nama: string
  noHp: string
  email: string | null
  role: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  cabang?: { nama: string | null }
}

type ApiData = {
  nasabah: UserItem[]
  karyawan: UserItem[]
  counts: { totalNasabah: number; totalKaryawan: number; totalPinjamanAktif: number }
  policy: PasswordPolicy
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSymbol: false,
}

const formatPolicyValue = (value: boolean) => value ? 'Ya' : 'Tidak'

export default function AdminPenggunaPage() {
  const [tab, setTab] = useState<TabId>('ringkasan')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingPolicy, setSavingPolicy] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [data, setData] = useState<ApiData>({
    nasabah: [],
    karyawan: [],
    counts: { totalNasabah: 0, totalKaryawan: 0, totalPinjamanAktif: 0 },
    policy: DEFAULT_POLICY,
  })
  const [policyDraft, setPolicyDraft] = useState<PasswordPolicy>(DEFAULT_POLICY)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pengguna')
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal memuat data')
      setData(json.data)
      setPolicyDraft(json.data.policy)
    } catch (err) {
      toast.error('Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredNasabah = useMemo(() => data.nasabah.filter(u =>
    !query || u.nama.toLowerCase().includes(query.toLowerCase()) ||
    u.noHp.includes(query) ||
    u.email?.toLowerCase().includes(query.toLowerCase() ?? '')
  ), [data.nasabah, query])

  const filteredKaryawan = useMemo(() => data.karyawan.filter(u =>
    !query || u.nama.toLowerCase().includes(query.toLowerCase()) ||
    u.noHp.includes(query) ||
    u.email?.toLowerCase().includes(query.toLowerCase() ?? '')
  ), [data.karyawan, query])

  const handleUpdateUser = async (id: string, payload: Record<string, any>) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/pengguna', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      })
      const json = await res.json()
      if (!res.ok) { throw new Error(json.message || 'Gagal memperbarui user') }
      const updated = json.data.user
      setData(curr => ({
        ...curr,
        nasabah: curr.nasabah.map(u => u.id === updated.id ? updated : u),
        karyawan: curr.karyawan.map(u => u.id === updated.id ? updated : u),
      }))
      toast.success('Perubahan tersimpan')
    } catch (err) {
      toast.error((err as Error).message || 'Gagal memperbarui pengguna')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSavePolicy = async () => {
    setSavingPolicy(true)
    try {
      const updates = [
        { kunci: 'PASSWORD_MIN_LENGTH', nilai: String(policyDraft.minLength) },
        { kunci: 'PASSWORD_REQUIRE_UPPERCASE', nilai: String(policyDraft.requireUppercase) },
        { kunci: 'PASSWORD_REQUIRE_NUMBER', nilai: String(policyDraft.requireNumber) },
        { kunci: 'PASSWORD_REQUIRE_SYMBOL', nilai: String(policyDraft.requireSymbol) },
      ]
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal menyimpan kebijakan password')
      setData(curr => ({ ...curr, policy: policyDraft }))
      toast.success('Kebijakan password tersimpan')
    } catch (err) {
      toast.error((err as Error).message || 'Gagal menyimpan kebijakan password')
    } finally {
      setSavingPolicy(false)
    }
  }

  const summaryCards = [
    { label: 'Total Nasabah', value: loading ? '—' : data.counts.totalNasabah.toLocaleString(), detail: 'Semua akun nasabah terdaftar' },
    { label: 'Total Karyawan/Admin', value: loading ? '—' : data.counts.totalKaryawan.toLocaleString(), detail: 'Pengguna internal platform' },
    { label: 'Total Pinjaman Aktif', value: loading ? '—' : formatRupiah(data.counts.totalPinjamanAktif, true), detail: 'Total dana pinjaman aktif saat ini' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-subtitle">Kelola nasabah, staf, dan aturan password di satu tempat</p>
        </div>
        <button onClick={loadData} className="btn-primary gap-2">
          <RefreshCcw size={16} /> Muat Ulang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {summaryCards.map(card => (
          <div key={card.label} className="card p-5">
            <div className="text-sm text-slate-500 mb-2">{card.label}</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</div>
            <p className="text-xs text-slate-400 mt-2">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TAB_ITEMS.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={cn('px-4 py-2 text-sm rounded-xl transition-all', tab === item.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800')}
          >{item.label}</button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === 'ringkasan' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div><h2 className="section-title">Data Ringkasan</h2><p className="text-sm text-slate-500">Temukan metrik pengguna dalam satu tampilan.</p></div>
                <Shield size={20} className="text-blue-600" />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-slate-500">Nasabah</div>
                    <div className="text-xl font-semibold mt-2">{data.counts.totalNasabah.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-slate-500">Karyawan & Admin</div>
                    <div className="text-xl font-semibold mt-2">{data.counts.totalKaryawan.toLocaleString()}</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="text-sm text-slate-500">Total Dana Pinjaman Aktif</div>
                  <div className="text-xl font-semibold mt-2">{formatRupiah(data.counts.totalPinjamanAktif, true)}</div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div><h2 className="section-title">Kebijakan Password</h2><p className="text-sm text-slate-500">Kebijakan yang diterapkan saat pendaftaran dan reset password.</p></div>
                <Key size={20} className="text-blue-600" />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span>Minimal karakter</span>
                  <span className="font-semibold">{data.policy.minLength}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span>Wajib huruf kapital</span>
                  <span className="font-semibold">{formatPolicyValue(data.policy.requireUppercase)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span>Wajib angka</span>
                  <span className="font-semibold">{formatPolicyValue(data.policy.requireNumber)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wajib simbol khusus</span>
                  <span className="font-semibold">{formatPolicyValue(data.policy.requireSymbol)}</span>
                </div>
              </div>
              <div className="mt-6 text-xs text-slate-400">Perubahan kebijakan password bisa dilakukan pada tab Kebijakan Password.</div>
            </div>
          </div>
        )}

        {(tab === 'nasabah' || tab === 'karyawan') && (
          <div className="card p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="section-title">{tab === 'nasabah' ? 'Data Nasabah' : 'Data Karyawan & Admin'}</h2>
                <p className="text-sm text-slate-500">Cari, aktifkan/deaktifkan, atau ubah peran pengguna.</p>
              </div>
              <div className="relative max-w-md w-full md:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama, HP, atau email..." className="input pl-10" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>HP / Email</th>
                    <th>Status</th>
                    {tab === 'karyawan' && <th>Role</th>}
                    <th>Terdaftar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading ? Array.from({ length: 5 }, () => null as UserItem | null) : (tab === 'nasabah' ? filteredNasabah : filteredKaryawan)).map((user, index) => (
                    <tr key={loading ? index : user?.id}>
                      <td>
                        {loading ? <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : user && (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700">{user.nama.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{user.nama}</div>
                              <div className="text-xs text-slate-400">{user.cabang?.nama ?? ''}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>{loading ? <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : user && (<div className="text-sm text-slate-500">{user.noHp} {user.email ? `· ${user.email}` : ''}</div>)}</td>
                      <td>{loading ? <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : user && (
                        <span className={cn('badge text-xs', user.isActive ? 'badge-aktif' : 'badge-ditolak')}>{user.isActive ? 'Aktif' : 'Nonaktif'}</span>
                      )}</td>
                      {tab === 'karyawan' && (
                        <td>{loading ? <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : user && <span className="text-sm text-slate-500">{user.role}</span>}</td>
                      )}
                      <td>{loading ? <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : user && formatDate(user.createdAt)}</td>
                      <td>
                        {loading ? <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : user && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                              disabled={updatingId === user.id}
                              className="btn-secondary btn-sm"
                            >
                              {updatingId === user.id ? <Loader2 size={14} className="animate-spin" /> : user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            {tab === 'karyawan' && (
                              <button
                                onClick={() => handleUpdateUser(user.id, { role: user.role === 'ADMIN' ? 'PETUGAS' : 'ADMIN' })}
                                disabled={updatingId === user.id}
                                className="btn-primary btn-sm"
                              >
                                {updatingId === user.id ? <Loader2 size={14} className="animate-spin" /> : user.role === 'ADMIN' ? 'Jadikan Petugas' : 'Jadikan Admin'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && (tab === 'nasabah' ? filteredNasabah : filteredKaryawan).length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <UserPlus size={32} className="mx-auto mb-3 text-slate-300" />
                  <p>Tidak ada data yang cocok.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'password' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title">Kebijakan Password</h2>
                <p className="text-sm text-slate-500">Atur aturan password bagi pengguna baru dan reset password.</p>
              </div>
              <button onClick={handleSavePolicy} disabled={savingPolicy} className="btn-primary gap-2">
                {savingPolicy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Simpan
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Minimal Karakter</label>
                <input type="number" min={6} max={32} value={policyDraft.minLength}
                  onChange={e => setPolicyDraft(p => ({ ...p, minLength: Number(e.target.value) }))}
                  className="input" />
              </div>
              <div>
                <label className="label">Wajib Huruf Kapital</label>
                <select value={String(policyDraft.requireUppercase)} onChange={e => setPolicyDraft(p => ({ ...p, requireUppercase: e.target.value === 'true' }))} className="input">
                  <option value="true">Ya</option>
                  <option value="false">Tidak</option>
                </select>
              </div>
              <div>
                <label className="label">Wajib Angka</label>
                <select value={String(policyDraft.requireNumber)} onChange={e => setPolicyDraft(p => ({ ...p, requireNumber: e.target.value === 'true' }))} className="input">
                  <option value="true">Ya</option>
                  <option value="false">Tidak</option>
                </select>
              </div>
              <div>
                <label className="label">Wajib Simbol Khusus</label>
                <select value={String(policyDraft.requireSymbol)} onChange={e => setPolicyDraft(p => ({ ...p, requireSymbol: e.target.value === 'true' }))} className="input">
                  <option value="true">Ya</option>
                  <option value="false">Tidak</option>
                </select>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <p className="font-semibold mb-2">Catatan</p>
              <p>Kebijakan ini akan dipakai saat pengguna baru mendaftar dan saat melakukan reset password.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
