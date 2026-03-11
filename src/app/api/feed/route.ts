import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') || null
  const category = searchParams.get('category') || null
  const search = searchParams.get('search') || null
  const limit = parseInt(searchParams.get('limit') || '30', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const supabase = createServerClient()
  const { data, error } = await supabase.rpc('get_feed', {
    p_source_name: source,
    p_category_slug: category,
    p_search: search,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
