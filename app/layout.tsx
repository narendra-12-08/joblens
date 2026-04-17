import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'JobLens', template: '%s — JobLens' },
  description: 'Search jobs from every source in one place — local & remote',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster theme="dark" richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
