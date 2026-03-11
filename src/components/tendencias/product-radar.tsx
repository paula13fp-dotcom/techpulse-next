'use client'

import { useState } from 'react'
import { KpiCard } from '@/components/ui/kpi-card'
import { EmptyState } from '@/components/ui/loading'
import { CATEGORIES } from '@/lib/constants'

interface ProductRow {
  canonical_name: string
  category: string
  mentions_7d: number
  mentions_30d: number
  avg_pos: number | null
  avg_neg: number | null
}

export function ProductRadar({ data }: { data: ProductRow[] }) {
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = filter
    ? data.filter((p) => p.category === filter)
    : data

  const totalMentions7d = filtered.reduce((s, p) => s + p.mentions_7d, 0)
  const topProduct = filtered[0]?.canonical_name ?? '-'

  if (data.length === 0) {
    return <EmptyState icon="📊" message="No hay datos de productos todavia" />
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            filter === null ? 'bg-brand-orange text-white' : 'bg-[var(--secondary)] text-gray-400 hover:text-white'
          }`}
        >
          Todas
        </button>
        {['Moviles', 'Smartwatches', 'Tablets'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === cat ? 'bg-brand-orange text-white' : 'bg-[var(--secondary)] text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon="📦" label="Productos" value={filtered.length} />
        <KpiCard icon="📢" label="Menciones 7d" value={totalMentions7d.toLocaleString('es-ES')} />
        <KpiCard icon="🏆" label="Top producto" value={topProduct} />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Categoria</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">7d</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">30d</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">% Pos</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">% Neg</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.canonical_name} className="border-b border-[var(--border)] hover:bg-white/5 transition">
                <td className="px-4 py-3 text-sm text-white font-medium">{p.canonical_name}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{p.category}</td>
                <td className="px-4 py-3 text-sm text-right text-brand-orange font-semibold">{p.mentions_7d}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-300">{p.mentions_30d}</td>
                <td className="px-4 py-3 text-sm text-right text-green-400">
                  {p.avg_pos != null ? `${p.avg_pos}%` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-400">
                  {p.avg_neg != null ? `${p.avg_neg}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
