import { KpiCard } from '@/components/ui/kpi-card'

interface StatsOverviewProps {
  postCount: number
  sourceCount: number
  lastUpdate: string | null
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Sin datos'
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Hace menos de 1h'
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${Math.floor(hours / 24)}d`
}

export function StatsOverview({ postCount, sourceCount, lastUpdate }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KpiCard
        icon="📰"
        label="Posts totales"
        value={postCount.toLocaleString('es-ES')}
      />
      <KpiCard
        icon="📡"
        label="Fuentes monitorizadas"
        value={sourceCount}
      />
      <KpiCard
        icon="🕐"
        label="Ultima actualizacion"
        value={timeAgo(lastUpdate)}
        subtitle={lastUpdate ? new Date(lastUpdate).toLocaleString('es-ES') : undefined}
      />
    </div>
  )
}
