import { Router } from 'express'

import { env } from '@/config/env'
import { analyzeImage } from '@/libs/google-ai'
import { db } from '@/libs/prisma'
import requestValidationMiddleware from '@/middlewares/request-validate.middleware'
import {
  UpdateImageBodySchema,
  updateImageBodySchema,
} from '@/schemas/upload-image.schemas'
import { getStartAndEndDate } from '@/utils/get-startand-enddate'
import { HttpStatus } from '@/utils/http-status'

const updateImageRoute: Router = Router()

updateImageRoute.post(
  '/upload',
  requestValidationMiddleware({
    body: updateImageBodySchema,
  }),
  async (req, res) => {
    const { image, measureType, measureDatetime, customerCode } =
      req.body as UpdateImageBodySchema

    const { startDate, endDate } = getStartAndEndDate(measureDatetime)

    const hasMeasureInDate = await db.measure.findFirst({
      where: {
        measureDatetime: {
          gte: startDate,
          lte: endDate,
        },
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

    const imageUrl = `${env.URL_DEPLOY}/image/${measureCreated.id}`

    const result = {
      image_url: imageUrl,
      measure_value: data.value,
      measure_uuid: measureCreated.id,
    }

    res.status(HttpStatus.OK).json(result)
  },
)

export { updateImageRoute }
