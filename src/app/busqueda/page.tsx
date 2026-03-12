import { createServerClient } from '@/lib/supabase/server'
import { BusquedaClient } from '@/components/busqueda/busqueda-client'

export const revalidate = 1800 // 30 min

async function getData() {
  const supabase = createServerClient()

  // Get cached market data
  const { data: cacheRows } = await supabase
    .from('market_cache')
    .select('*')
    .order('updated_at', { ascending: false })

  const cache: Record<string, Record<string, unknown>> = {}
  for (const row of cacheRows ?? []) {
    cache[`${row.cache_type}__${row.category}`] = {
      data: row.data,
      updated_at: row.updated_at,
    }
  }

  return { cache }
}

export default async function BusquedaPage() {
  const { cache } = await getData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tendencias Busqueda</h1>
        <p className="text-sm text-gray-500 mt-1">
          Google Trends, Amazon bestsellers y Keyword Planner
        </p>
      </div>

      <BusquedaClient cache={cache} />
    </div>
  )
}
