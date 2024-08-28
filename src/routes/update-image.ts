import { Router } from 'express'
import { z } from 'zod'

import { model } from '@/libs/google-ai'
import { HttpStatus } from '@/utils/http-status'
import { parseJsonText } from '@/utils/parse-json-text'

const updateImageRoute: Router = Router()

const bodySchema = z
  .object({
    image: z.string().base64('Enter a valid base64 encoded image'),
    customer_code: z.string(),
    measure_datetime: z.coerce.date(),
    measure_type: z.enum(['WATER', 'GAS']),
  })
  .transform((data) => ({
    image: data.image,
    customerCode: data.customer_code,
    measureDatetime: data.measure_datetime,
    measureType: data.measure_type,
  }))

updateImageRoute.post('/upload', async (req, res) => {
  const payload = bodySchema.safeParse(req.body)

  if (!payload.success) {
    const message = payload.error.issues.map(
      (issue) => `${issue.path[0]}: ${issue.message}`,
    )[0]

    return res.status(HttpStatus.BAD_REQUEST).json({
      error_code: 'INVALID_DATA',
      error_description:
        message || 'Os dados fornecidos no corpo da requisição são inválidos.',
    })
  }

  const { image, measureType } = payload.data

  const data = await analyzeImage(image, measureType)

  if (!data) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error_code: 'INVALID_DATA',
      error_description: 'Não foi possível analisar a imagem.',
    })
  }

  res.status(200).json({ message: 'Image uploaded successfully', data })
})

async function analyzeImage(image: string, measureType: string) {
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

export { updateImageRoute }
