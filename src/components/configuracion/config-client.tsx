'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SourceStat {
  display_name: string
  post_count: number
  last_scraped: string | null
}

interface Batch {
  id: string
  job_type: string
  status: string
  post_count: number
  started_at: string | null
  completed_at: string | null
  error_message: string | null
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Nunca'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Hace <1h'
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

export function ConfigClient({
  sourceStats,
  batches,
}: {
  sourceStats: SourceStat[]
  batches: Batch[]
}) {
  const totalPosts = sourceStats.reduce((s, src) => s + src.post_count, 0)
  const activeSources = sourceStats.filter((s) => s.post_count > 0).length

  return (
    <div className="space-y-6">
      {/* System KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-gray-400">Posts en base de datos</p>
          <p className="text-2xl font-bold text-white mt-1">{totalPosts.toLocaleString('es-ES')}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-gray-400">Fuentes activas</p>
          <p className="text-2xl font-bold text-white mt-1">{activeSources} / {sourceStats.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-gray-400">Plataforma</p>
          <p className="text-2xl font-bold text-brand-orange mt-1">Next.js + Vercel</p>
        </div>
      </div>

      {/* Source status table */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de fuentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-400">Fuente</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-400">Posts</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-400">Ultimo scraping</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sourceStats.map((s) => {
                  const isActive = s.post_count > 0
                  return (
                    <tr key={s.display_name} className="border-b border-[var(--border)] hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-white">{s.display_name}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-300">{s.post_count}</td>
                      <td className="px-4 py-3 text-xs text-right text-gray-400">{timeAgo(s.last_scraped)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={isActive ? 'positive' : 'neutral'}>
                          {isActive ? 'Activa' : 'Sin datos'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent batches */}
      {batches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ultimos trabajos de analisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {batches.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg bg-[var(--secondary)] px-4 py-3"
                >
                  <div>
                    <span className="text-sm text-white font-medium">{b.job_type}</span>
                    <span className="text-xs text-gray-400 ml-2">({b.post_count} posts)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {b.started_at ? timeAgo(b.started_at) : '-'}
                    </span>
                    <Badge
                      variant={
                        b.status === 'completed' ? 'positive' : b.status === 'failed' ? 'negative' : 'neutral'
                      }
                    >
                      {b.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
