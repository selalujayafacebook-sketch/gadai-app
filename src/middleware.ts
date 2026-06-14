// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './lib/jwt'

const PROTECTED = ['/dashboard', '/gadai', '/pembayaran', '/riwayat', '/notifikasi', '/profil', '/simulasi', '/dokumen', '/referral', '/feedback']
const ADMIN_ONLY = ['/admin']
const OWNER_ONLY = ['/owner']
const AUTH_ROUTES = ['/login', '/register', '/lupa-password', '/verifikasi-otp']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('access_token')?.value

  let user: any = null
  if (token) {
    try { user = await verifyAccessToken(token) } catch {}
  }

  const isAuth = !!user
  const role = user?.role || ''

  // Redirect logged-in dari auth pages
  if (isAuth && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    if (role === 'OWNER') return NextResponse.redirect(new URL('/owner/dashboard', req.url))
    if (['ADMIN', 'SUPERADMIN'].includes(role)) return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    if (['PETUGAS', 'SUPERVISOR'].includes(role)) return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect nasabah routes
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    if (!isAuth) {
      const url = new URL('/login', req.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Protect admin routes
  if (ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    if (!isAuth) return NextResponse.redirect(new URL('/login', req.url))
    if (!['PETUGAS', 'SUPERVISOR', 'ADMIN', 'OWNER'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Protect owner routes
  if (OWNER_ONLY.some(p => pathname.startsWith(p))) {
    if (!isAuth) return NextResponse.redirect(new URL('/login', req.url))
    if (!['ADMIN', 'OWNER'].includes(role)) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
