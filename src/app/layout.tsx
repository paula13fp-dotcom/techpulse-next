import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'

export const metadata: Metadata = {
  title: 'TechPulse',
  description: 'Monitorización de tendencias tech en tiempo real',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
