import { Router } from 'express'
import { z } from 'zod'

import { HttpStatus } from '@/utils/http-status'

const updateImageRoute: Router = Router()

const bodySchema = z
  .object({
    image: z.string().base64(),
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

updateImageRoute.post('/upload', (req, res) => {
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

  const { customerCode, image, measureDatetime, measureType } = payload.data

  console.log('customer_code:', customerCode)
  console.log('image:', image)
  console.log('measure_datetime:', measureDatetime)
  console.log('measure_type:', measureType)

  res.status(200).json({ message: 'Image uploaded successfully' })
})

export { updateImageRoute }
