'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Analisis optimizado', icon: '🏠' },
  { href: '/tendencias', label: 'Tendencias RRSS', icon: '📱' },
  { href: '/busqueda', label: 'Tendencias Busqueda', icon: '📊' },
  { href: '/configuracion', label: 'Configuracion', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="text-3xl">📡</span>
          <span
            className="text-2xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            TechPulse
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                transition-all duration-200
                ${isActive
                  ? 'bg-white/10 text-white border-l-4 border-brand-orange'
                  : 'text-purple-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-purple-400 text-center">
          TechPulse v2.0 &middot; Next.js
        </p>
      </div>
    </aside>
  )
}
