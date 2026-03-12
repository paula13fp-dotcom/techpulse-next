'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/loading'
import ReactMarkdown from 'react-markdown'

interface Topic {
  id: number
  label: string
  description: string | null
  post_count: number
  is_trending: boolean
  category_name: string | null
  product_name: string | null
}

export function TrendingTopics({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) {
    return <EmptyState icon="🔍" message="No hay temas trending todavia" />
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id}>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">{topic.label}</h3>
                  {topic.is_trending && <Badge variant="trending">Trending</Badge>}
                  {topic.category_name && <Badge>{topic.category_name}</Badge>}
                  {topic.product_name && <Badge variant="default">{topic.product_name}</Badge>}
                </div>
                {topic.description && (
                  <div className="prose max-w-none text-sm">
                    <ReactMarkdown>{topic.description}</ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-brand-orange">{topic.post_count}</span>
                <p className="text-xs text-gray-400">posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
