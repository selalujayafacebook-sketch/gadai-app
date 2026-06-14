import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
export const ok = <T>(data: T, status=200) => NextResponse.json({ success:true, data }, { status })
export const created = <T>(data: T) => NextResponse.json({ success:true, data }, { status:201 })
export const error = (message: string, status=400, code?: string) => NextResponse.json({ success:false, message, code }, { status })
export const unauthorized = (msg='Sesi tidak valid.') => error(msg, 401, 'UNAUTHORIZED')
export const forbidden = (msg='Akses ditolak.') => error(msg, 403, 'FORBIDDEN')
export const notFound = (msg='Data tidak ditemukan.') => error(msg, 404, 'NOT_FOUND')
export const serverError = (msg='Terjadi kesalahan server.') => error(msg, 500, 'SERVER_ERROR')
export class AppError extends Error {
  constructor(message: string, public status=400, public code='APP_ERROR') { super(message) }
}
export function handleError(err: unknown) {
  console.error('[API]', err)
  if (err instanceof ZodError) return error(`Validasi: ${err.errors.map(e=>e.message).join(', ')}`, 422)
  if (err instanceof AppError) return error(err.message, err.status, err.code)
  if (err instanceof Error)    return serverError(err.message)
  return serverError()
}
