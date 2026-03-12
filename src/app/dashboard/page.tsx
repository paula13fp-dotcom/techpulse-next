import { createServerClient } from '@/lib/supabase/server'
import { DigestViewer } from '@/components/dashboard/digest-viewer'
import { StatsOverview } from '@/components/dashboard/stats-overview'

export const revalidate = 300 // 5 min cache

async function getData() {
  const supabase = createServerClient()

  const [digestRes, countRes, statsRes] = await Promise.all([
    supabase.rpc('get_latest_digest', { p_type: 'daily' }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.rpc('get_source_stats'),
  ])

  return {
    digest: digestRes.data?.[0] ?? null,
    postCount: countRes.count ?? 0,
    sourceStats: statsRes.data ?? [],
  }
}

export default async function DashboardPage() {
  const { digest, postCount, sourceStats } = await getData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen diario generado con IA
        </p>
      </div>

      {/* KPIs */}
      <StatsOverview
        postCount={postCount}
        sourceCount={sourceStats.length}
        lastUpdate={digest?.generated_at ?? null}
      />

      {/* Digest */}
      <DigestViewer digest={digest} />

      {/* Source Stats */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fuentes activas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourceStats.map((s: { display_name: string; post_count: number; last_scraped: string | null }) => (
            <div
              key={s.display_name}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
            >
              <span className="text-sm text-gray-800 font-medium">{s.display_name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{s.post_count} posts</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.post_count > 0 ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
