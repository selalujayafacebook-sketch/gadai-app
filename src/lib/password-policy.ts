import { db } from './db'

type RawSetting = { kunci: string; nilai: string }

export type PasswordPolicy = {
  minLength: number
  requireUppercase: boolean
  requireNumber: boolean
  requireSymbol: boolean
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSymbol: false,
}

function parsePolicy(settings: RawSetting[]): PasswordPolicy {
  const find = (key: string) => settings.find(item => item.kunci === key)?.nilai
  return {
    minLength: Number(find('PASSWORD_MIN_LENGTH') ?? DEFAULT_POLICY.minLength),
    requireUppercase: find('PASSWORD_REQUIRE_UPPERCASE') === 'true',
    requireNumber: find('PASSWORD_REQUIRE_NUMBER') === 'true',
    requireSymbol: find('PASSWORD_REQUIRE_SYMBOL') === 'true',
  }
}

export async function getPasswordPolicy() {
  const settings = await db.pengaturanSistem.findMany({
    where: {
      kunci: { in: ['PASSWORD_MIN_LENGTH', 'PASSWORD_REQUIRE_UPPERCASE', 'PASSWORD_REQUIRE_NUMBER', 'PASSWORD_REQUIRE_SYMBOL'] },
    },
  })
  return parsePolicy(settings)
}

export function validatePasswordPolicy(password: string, policy: PasswordPolicy) {
  if (password.length < policy.minLength) return `Password minimal ${policy.minLength} karakter.`
  if (policy.requireUppercase && !/[A-Z]/.test(password)) return 'Password harus mengandung huruf kapital.'
  if (policy.requireNumber && !/[0-9]/.test(password)) return 'Password harus mengandung angka.'
  if (policy.requireSymbol && !/[!@#$%^&*(),.?"':{}|<>]/.test(password)) return 'Password harus mengandung simbol khusus.'
  return null
}
