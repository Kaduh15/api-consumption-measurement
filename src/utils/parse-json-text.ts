import { z } from 'zod'

const measurementSchema = z.object({
  value: z.coerce.number(),
})

type Measurement = z.infer<typeof measurementSchema>

export function parseJsonText(rawText: string): Measurement | null {
  try {
    const cleanedText = rawText
      .replace(/```json/, '')
      .replace(/```/, '')
      .trim()

    const parsedObj = JSON.parse(cleanedText)

    const validatedObj = measurementSchema.parse(parsedObj)

    return validatedObj
  } catch (error) {
    console.error('Erro ao parsear ou validar o JSON:', error)
    return null
  }
}
