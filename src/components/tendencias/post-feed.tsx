'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { SelectFilter } from '@/components/ui/select-filter'
import { Loading, EmptyState } from '@/components/ui/loading'
import { SOURCE_ICONS, SENTIMENT_CONFIG } from '@/lib/constants'

interface FeedPost {
  id: number
  title: string | null
  body: string | null
  url: string | null
  author: string | null
  score: number
  comment_count: number
  view_count: number
  published_at: string
  source_name: string
  source_display: string
  sentiment: string | null
  positive_score: number | null
  negative_score: number | null
}

const CATEGORIES = [
  { label: 'Todas', value: '' },
  { label: 'Moviles', value: 'phones' },
  { label: 'Smartwatches', value: 'smartwatches' },
  { label: 'Tablets', value: 'tablets' },
]

const PAGE_SIZE = 30

export function PostFeed({ sources }: { sources: Array<{ name: string; display_name: string }> }) {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const sourceOptions = [
    { label: 'Todas las fuentes', value: '' },
    ...sources.map((s) => ({ label: s.display_name, value: s.name })),
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = getSupabaseClient()
      const { data } = await supabase.rpc('get_feed', {
        p_source_name: source || null,
        p_category_slug: category || null,
        p_search: search || null,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      })
      setPosts((data as FeedPost[]) ?? [])
      setLoading(false)
    }
    load()
  }, [source, category, search, page])

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'Hace <1h'
    if (h < 24) return `Hace ${h}h`
    return `Hace ${Math.floor(h / 24)}d`
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SelectFilter label="Fuente" value={source} onChange={(v) => { setSource(v); setPage(0) }} options={sourceOptions} className="w-48" />
        <SelectFilter label="Categoria" value={category} onChange={(v) => { setCategory(v); setPage(0) }} options={CATEGORIES} className="w-40" />
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Buscar en posts..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <Loading text="Cargando feed..." />
      ) : posts.length === 0 ? (
        <EmptyState icon="📭" message="No se encontraron posts" />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const icon = SOURCE_ICONS[post.source_name] ?? '📰'
            const sentimentKey = (post.sentiment ?? 'neutral') as keyof typeof SENTIMENT_CONFIG
            const sentiment = SENTIMENT_CONFIG[sentimentKey]

            return (
              <div
                key={post.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-brand-orange/30 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">{post.source_display}</span>
                      <span className="text-xs text-gray-600">{timeAgo(post.published_at)}</span>
                      {post.sentiment && (
                        <Badge variant={sentimentKey}>
                          {sentiment.icon} {sentiment.label}
                        </Badge>
                      )}
                    </div>
                    {post.url ? (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-white hover:text-brand-orange transition"
                      >
                        {post.title || 'Sin titulo'}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-white">{post.title || 'Sin titulo'}</p>
                    )}
                    {post.body && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{post.body}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {post.score > 0 && <span>⬆️ {post.score}</span>}
                      {post.comment_count > 0 && <span>💬 {post.comment_count}</span>}
                      {post.view_count > 0 && <span>👁️ {post.view_count.toLocaleString('es-ES')}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 py-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-lg bg-[var(--secondary)] px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-400">Pagina {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={posts.length < PAGE_SIZE}
              className="rounded-lg bg-[var(--secondary)] px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
