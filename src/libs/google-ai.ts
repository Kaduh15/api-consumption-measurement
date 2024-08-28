import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'

import { env } from '@/config/env'

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY)

export const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
})
