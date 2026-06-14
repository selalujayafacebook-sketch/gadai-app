import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'GadaiKu — Gadai Digital Premium', template: '%s | GadaiKu' },
  description: 'Platform gadai digital modern, aman, dan terpercaya. Proses 30 menit, bunga rendah, terdaftar OJK.',
  keywords: ['gadai online', 'pinjaman gadai', 'gadai emas', 'gadai elektronik', 'gadai digital'],
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f0f4f8' }, { media: '(prefers-color-scheme: dark)', color: '#060e1a' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} />
        </ThemeProvider>
      </body>
    </html>
  )
}
