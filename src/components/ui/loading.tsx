export function Loading({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
        <span className="text-sm text-gray-400">{text}</span>
      </div>
    </div>
  )
}

export function EmptyState({ icon = '📭', message = 'No hay datos disponibles' }: { icon?: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}
