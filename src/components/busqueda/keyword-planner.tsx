'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/loading'

interface KeywordPlannerProps {
  cache: Record<string, Record<string, unknown>>
}

interface KwpEntry {
  keyword: string
  avg_monthly_searches: number
  searches_display: string
  competition_label: string
  competition_index: number
}

export function KeywordPlanner({ cache }: KeywordPlannerProps) {
  const key = 'kwp__general'
  const entry = cache[key] as { data: KwpEntry[]; updated_at: string } | undefined
  const keywords = entry?.data ?? []

  if (keywords.length === 0) {
    return (
      <EmptyState
        icon="🔑"
        message="No hay datos de Keyword Planner. Se generaran automaticamente con los scrapers."
      />
    )
  }

  // Sort by volume desc for top section
  const byVolume = [...keywords].sort((a, b) => b.avg_monthly_searches - a.avg_monthly_searches).slice(0, 20)
  // Low competition opportunities
  const lowComp = keywords
    .filter((k) => k.competition_label === 'Baja' || k.competition_label === 'LOW')
    .sort((a, b) => b.avg_monthly_searches - a.avg_monthly_searches)
    .slice(0, 20)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top volume */}
        <Card>
          <CardHeader>
            <CardTitle>Mayor volumen de busqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {byVolume.map((kw) => (
                <div key={kw.keyword} className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                  <span className="text-sm text-white">{kw.keyword}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{kw.searches_display}/mes</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      kw.competition_label === 'Alta' || kw.competition_label === 'HIGH'
                        ? 'bg-red-500/20 text-red-400'
                        : kw.competition_label === 'Media' || kw.competition_label === 'MEDIUM'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {kw.competition_label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low competition */}
        <Card>
          <CardHeader>
            <CardTitle>Oportunidades (baja competencia)</CardTitle>
          </CardHeader>
          <CardContent>
            {lowComp.length === 0 ? (
              <p className="text-sm text-gray-400">Sin oportunidades de baja competencia</p>
            ) : (
              <div className="space-y-1.5">
                {lowComp.map((kw) => (
                  <div key={kw.keyword} className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                    <span className="text-sm text-white">{kw.keyword}</span>
                    <span className="text-xs text-gray-400">{kw.searches_display}/mes</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {entry?.updated_at && (
        <p className="text-xs text-gray-500 text-center">
          Datos actualizados: {new Date(entry.updated_at).toLocaleString('es-ES')}
        </p>
      )}
    </div>
  )
}
