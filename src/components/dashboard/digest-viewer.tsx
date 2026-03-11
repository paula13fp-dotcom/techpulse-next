'use client'

import ReactMarkdown from 'react-markdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/loading'

interface DigestViewerProps {
  digest: {
    content: string
    generated_at: string
    period_start: string
    period_end: string
  } | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DigestViewer({ digest }: DigestViewerProps) {
  if (!digest) {
    return (
      <Card>
        <EmptyState icon="📝" message="Aun no se ha generado ningun analisis" />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analisis del dia</CardTitle>
          <span className="text-xs text-gray-400">
            {formatDate(digest.generated_at)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none text-gray-300">
          <ReactMarkdown>{digest.content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
