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
            filter === null ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'
          }`}
        >
          Todas
        </button>
        {['Moviles', 'Smartwatches', 'Tablets'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === cat ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'
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
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">7d</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">30d</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">% Pos</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">% Neg</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.canonical_name} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{p.canonical_name}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{p.category}</td>
                <td className="px-4 py-3 text-sm text-right text-brand-orange font-semibold">{p.mentions_7d}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{p.mentions_30d}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">
                  {p.avg_pos != null ? `${p.avg_pos}%` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-600">
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
