'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/loading'
import { MARKET_CATEGORIES } from '@/lib/constants'

interface GoogleTrendsProps {
  cache: Record<string, Record<string, unknown>>
}

export function GoogleTrends({ cache }: GoogleTrendsProps) {
  const [selected, setSelected] = useState<string>(MARKET_CATEGORIES[0])

  // Extract category slug for cache key lookup
  const catName = selected.replace(/^[^\s]+\s/, '')
  const cacheKey = `google_trends__${catName.toLowerCase()}`
  const entry = cache[cacheKey] as { data: { top?: Array<{ query: string; value: number }>; rising?: Array<{ query: string; value: string }> }; updated_at: string } | undefined

  const top = entry?.data?.top ?? []
  const rising = entry?.data?.rising ?? []

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {MARKET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selected === cat
                ? 'bg-brand-orange text-white'
                : 'bg-[var(--secondary)] text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {top.length === 0 && rising.length === 0 ? (
        <EmptyState icon="📈" message="No hay datos de Google Trends para esta categoria" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top searches */}
          <Card>
            <CardHeader>
              <CardTitle>Busquedas populares</CardTitle>
            </CardHeader>
            <CardContent>
              {top.length === 0 ? (
                <p className="text-sm text-gray-400">Sin datos</p>
              ) : (
                <div className="space-y-2">
                  {top.map((item, i) => (
                    <div key={item.query} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-6">{i + 1}.</span>
                        <span className="text-sm text-white">{item.query}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-orange rounded-full"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rising searches */}
          <Card>
            <CardHeader>
              <CardTitle>Busquedas en alza</CardTitle>
            </CardHeader>
            <CardContent>
              {rising.length === 0 ? (
                <p className="text-sm text-gray-400">Sin datos</p>
              ) : (
                <div className="space-y-2">
                  {rising.map((item, i) => (
                    <div key={item.query} className="flex items-center justify-between py-1">
                      <span className="text-sm text-white">{item.query}</span>
                      <span className="text-xs font-semibold text-green-400">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {entry?.updated_at && (
        <p className="text-xs text-gray-500 text-center">
          Datos actualizados: {new Date(entry.updated_at).toLocaleString('es-ES')}
        </p>
      )}
    </div>
  )
}
