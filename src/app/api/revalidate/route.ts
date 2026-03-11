import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  // Simple secret-based auth for GitHub Actions
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Revalidate all pages
  revalidatePath('/dashboard')
  revalidatePath('/tendencias')
  revalidatePath('/busqueda')
  revalidatePath('/configuracion')

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() })
}
