import { createServerClient } from '@/lib/supabase/server'
import { ConfigClient } from '@/components/configuracion/config-client'

export const revalidate = 60

async function getData() {
  const supabase = createServerClient()

  const [statsRes, batchesRes] = await Promise.all([
    supabase.rpc('get_source_stats'),
    supabase
      .from('analysis_batches')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10),
  ])

  return {
    sourceStats: statsRes.data ?? [],
    batches: batchesRes.data ?? [],
  }
}

export default async function ConfiguracionPage() {
  const { sourceStats, batches } = await getData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuracion</h1>
        <p className="text-sm text-gray-400 mt-1">Estado del sistema y fuentes</p>
      </div>

      <ConfigClient sourceStats={sourceStats} batches={batches} />
    </div>
  )
}
