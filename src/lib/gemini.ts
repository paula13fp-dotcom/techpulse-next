import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
})

export async function generateAnalysis(prompt: string): Promise<string> {
  const result = await geminiFlash.generateContent(prompt)
  return result.response.text()
}
