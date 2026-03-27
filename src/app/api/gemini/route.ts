import { NextRequest, NextResponse } from 'next/server'
import { generateAnalysis } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: 'prompt requerido' }, { status: 400 })
    }
    const text = await generateAnalysis(prompt)
    return NextResponse.json({ text })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'Error al generar análisis' }, { status: 500 })
  }
}
