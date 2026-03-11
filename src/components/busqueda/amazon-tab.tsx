'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/loading'

interface AmazonTabProps {
  cache: Record<string, Record<string, unknown>>
}

interface AmazonProduct {
  title: string
  price: string
  rating: string
  url: string
}

export function AmazonTab({ cache }: AmazonTabProps) {
  const [tab, setTab] = useState<'bestsellers' | 'new_releases'>('bestsellers')

  const key = `amazon_${tab}__general`
  const entry = cache[key] as { data: AmazonProduct[]; updated_at: string } | undefined
  const products = entry?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('bestsellers')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            tab === 'bestsellers' ? 'bg-brand-orange text-white' : 'bg-[var(--secondary)] text-gray-400 hover:text-white'
          }`}
        >
          Mas vendidos
        </button>
        <button
          onClick={() => setTab('new_releases')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            tab === 'new_releases' ? 'bg-brand-orange text-white' : 'bg-[var(--secondary)] text-gray-400 hover:text-white'
          }`}
        >
          Novedades
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="🛒" message="No hay datos de Amazon disponibles" />
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">Pos.</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">Producto</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-400">Precio</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-400">Valoracion</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i} className="border-b border-[var(--border)] hover:bg-white/5 transition">
                      <td className="px-3 py-2 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2">
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white hover:text-brand-orange transition line-clamp-1"
                          >
                            {p.title}
                          </a>
                        ) : (
                          <span className="text-sm text-white line-clamp-1">{p.title}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-brand-orange font-medium">{p.price}</td>
                      <td className="px-3 py-2 text-sm text-right text-yellow-400">{p.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {entry?.updated_at && (
        <p className="text-xs text-gray-500 text-center">
          Datos actualizados: {new Date(entry.updated_at).toLocaleString('es-ES')}
        </p>
      )}
    </div>
  )
}
