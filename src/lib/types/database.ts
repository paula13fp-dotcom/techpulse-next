// TypeScript types matching the Supabase/PostgreSQL schema

export interface Source {
  id: number
  name: string
  display_name: string
  base_url: string | null
  is_active: boolean
}

export interface DeviceCategory {
  id: number
  slug: string
  name: string
}

export interface Product {
  id: number
  canonical_name: string
  brand: string | null
  model_family: string | null
  category_id: number
  aliases: string[]
  release_date: string | null
  is_tracked: boolean
  created_at: string
}

export interface Post {
  id: number
  source_id: number
  external_id: string
  content_type: string
  title: string | null
  body: string | null
  body_raw: string | null
  author: string | null
  url: string | null
  thumbnail_url: string | null
  upvotes: number
  downvotes: number
  score: number
  comment_count: number
  view_count: number
  like_count: number
  share_count: number
  published_at: string
  scraped_at: string
  updated_at: string | null
  content_hash: string | null
  // Joined relations
  sources?: Source
  sentiment_results?: SentimentResult[]
}

export interface SentimentResult {
  id: number
  post_id: number
  positive_score: number
  neutral_score: number
  negative_score: number
  label: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence: number | null
  product_id: number | null
  model_used: string
  analyzed_at: string
  batch_id: string | null
}

export interface TopicCluster {
  id: number
  label: string
  description: string | null
  post_count: number
  category_id: number | null
  product_id: number | null
  first_seen_at: string
  last_seen_at: string
  is_trending: boolean
  batch_id: string | null
  // Joined
  device_categories?: DeviceCategory
  products?: Product
}

export interface Digest {
  id: number
  digest_type: 'daily' | 'weekly'
  period_start: string
  period_end: string
  content: string
  model_used: string
  token_count: number | null
  generated_at: string
  category_id: number | null
}

export interface MarketCacheEntry {
  id: number
  cache_type: string
  category: string
  data: Record<string, unknown>[] | Record<string, unknown>
  updated_at: string
}

export interface SourceStat {
  display_name: string
  post_count: number
  last_scraped: string | null
}

export interface ProductRadarEntry {
  canonical_name: string
  category: string
  mentions_7d: number
  mentions_30d: number
  avg_pos: number | null
  avg_neg: number | null
}
