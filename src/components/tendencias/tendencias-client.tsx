'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TrendingTopics } from './trending-topics'
import { ProductRadar } from './product-radar'
import { PostFeed } from './post-feed'

interface TendenciasClientProps {
  initialTopics: Array<{
    id: number
    label: string
    description: string | null
    post_count: number
    is_trending: boolean
    category_name: string | null
    product_name: string | null
  }>
  initialRadar: Array<{
    canonical_name: string
    category: string
    mentions_7d: number
    mentions_30d: number
    avg_pos: number | null
    avg_neg: number | null
  }>
  sources: Array<{ name: string; display_name: string }>
}

export function TendenciasClient({ initialTopics, initialRadar, sources }: TendenciasClientProps) {
  return (
    <Tabs defaultValue="trending">
      <TabsList>
        <TabsTrigger value="trending">Trending Topics</TabsTrigger>
        <TabsTrigger value="radar">Product Radar</TabsTrigger>
        <TabsTrigger value="feed">Feed</TabsTrigger>
      </TabsList>

      <TabsContent value="trending">
        <TrendingTopics topics={initialTopics} />
      </TabsContent>

      <TabsContent value="radar">
        <ProductRadar data={initialRadar} />
      </TabsContent>

      <TabsContent value="feed">
        <PostFeed sources={sources} />
      </TabsContent>
    </Tabs>
  )
}
