'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient<any> | null = null

export function getSupabaseClient(): SupabaseClient<any> {
  if (!client) {
    client = createClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
