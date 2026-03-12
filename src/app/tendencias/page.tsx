import { createServerClient } from '@/lib/supabase/server'
import { TendenciasClient } from '@/components/tendencias/tendencias-client'

export const revalidate = 300

async function getData() {
  const supabase = createServerClient()

  const [topicsRes, radarRes, sourcesRes] = await Promise.all([
    supabase.rpc('get_trending_topics', { p_limit: 10 }),
    supabase.rpc('get_product_radar'),
    supabase.from('sources').select('name, display_name').order('display_name'),
  ])

  return {
    topics: topicsRes.data ?? [],
    radar: radarRes.data ?? [],
    sources: sourcesRes.data ?? [],
  }
}

export default async function TendenciasPage() {
  const { topics, radar, sources } = await getData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tendencias RRSS</h1>
        <p className="text-sm text-gray-500 mt-1">
          Temas trending, radar de productos y feed de posts
        </p>
      </div>

      <TendenciasClient
        initialTopics={topics}
        initialRadar={radar}
        sources={sources}
      />
    </div>
  )
}
