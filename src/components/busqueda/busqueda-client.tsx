'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GoogleTrends } from './google-trends'
import { AmazonTab } from './amazon-tab'
import { KeywordPlanner } from './keyword-planner'

interface BusquedaClientProps {
  cache: Record<string, Record<string, unknown>>
}

export function BusquedaClient({ cache }: BusquedaClientProps) {
  return (
    <Tabs defaultValue="trends">
      <TabsList>
        <TabsTrigger value="trends">Google Trends</TabsTrigger>
        <TabsTrigger value="amazon">Amazon</TabsTrigger>
        <TabsTrigger value="kwp">Keyword Planner</TabsTrigger>
      </TabsList>

      <TabsContent value="trends">
        <GoogleTrends cache={cache} />
      </TabsContent>

      <TabsContent value="amazon">
        <AmazonTab cache={cache} />
      </TabsContent>

      <TabsContent value="kwp">
        <KeywordPlanner cache={cache} />
      </TabsContent>
    </Tabs>
  )
}
