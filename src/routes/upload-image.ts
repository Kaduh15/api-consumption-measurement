import { Router } from 'express'
import { z } from 'zod'

import { env } from '@/config/env'
import { model } from '@/libs/google-ai'
import { db } from '@/libs/prisma'
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
    measureDatetime: data.measure_datetime.toISOString(),
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

  const { image, measureType, measureDatetime, customerCode } = payload.data

  const hasMeasureInDate = await db.measure.findFirst({
    where: {
      measureDatetime,
      measureType,
      customerCode,
    },
  })

  if (hasMeasureInDate) {
    return res.status(HttpStatus.CONFLICT).json({
      error_code: 'DOUBLE_REPORT',
      error_description: 'Leitura do mês já realizada',
    })
  }

  const data = await analyzeImage(image, measureType)

  if (!data) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error_code: 'INVALID_DATA',
      error_description: 'Não foi possível analisar a imagem.',
    })
  }

  const measureCreated = await db.measure.create({
    data: {
      imageBase64: image,
      measureValue: data.value,
      measureDatetime,
      measureType,
      customerCode,
    },
  })

  const imageUrl = `${env.URL_DEPLOY}/api/image/${measureCreated.id}`

  const result = {
    image_url: imageUrl,
    measure_value: data.value,
    measure_uuid: measureCreated.id,
  }

  res.status(HttpStatus.CREATED).json(result)
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
