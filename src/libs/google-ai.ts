import { GoogleGenerativeAI } from '@google/generative-ai'

import { env } from '@/config/env'
import { parseJsonText } from '@/utils/parse-json-text'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
})

export async function analyzeImage(image: string, measureType: string) {
  const result = await model.generateContent([
    `I want to analyze the ${measureType} consumption meter image, capture the value and return it all to me in a JSON.

    The JSON should be in the following format:
    {
      "value": "10"
    }
    `,
    {
      inlineData: {
        data: image,
        mimeType: 'image/jpg',
      },
    },
  ])

  const data = parseJsonText(result.response.text())

  return data
}
