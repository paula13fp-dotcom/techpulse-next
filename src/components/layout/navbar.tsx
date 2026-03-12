'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tendencias', label: 'Tendencias' },
  { href: '/busqueda', label: 'Busqueda' },
  { href: '/configuracion', label: 'Config' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="text-2xl">📡</span>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 leading-tight">
              TechPulse
            </span>
            <span className="text-[10px] text-gray-400 leading-tight">
              Trend Monitor
            </span>
          </div>
        </Link>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-brand-orange bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">v2.0</span>
          <div className="h-8 w-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <span className="text-sm">P</span>
          </div>
        </div>
      </div>
    </header>
  )
}
