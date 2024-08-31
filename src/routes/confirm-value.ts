import { Router } from 'express'

import { db } from '@/libs/prisma'
import requestValidationMiddleware from '@/middlewares/request-validate.middleware'
import {
  confirmValueBodySchema,
  ConfirmValueBodySchemaType,
} from '@/schemas/confirm-value.schema'
import { HttpStatus } from '@/utils/http-status'

const confirmValueRouter: Router = Router()

confirmValueRouter.patch(
  '/confirm',
  requestValidationMiddleware({
    body: confirmValueBodySchema,
  }),
  async (req, res) => {
    const { confirmedValue, measureUUID } =
      req.body as ConfirmValueBodySchemaType

    const measure = await db.measure.findUnique({
      where: {
        id: measureUUID,
      },
    })

    if (!measure) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura do mês não encontrada',
      })
    }

    if (measure.hasConfirmed) {
      return res.status(HttpStatus.CONFLICT).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada',
      })
    }

    await db.measure.update({
      where: {
        id: measureUUID,
      },
      data: {
        hasConfirmed: true,
        measureValue: confirmedValue,
      },
    })

    return res.status(HttpStatus.OK).json({
      success: true,
    })
  },
)

export { confirmValueRouter }
