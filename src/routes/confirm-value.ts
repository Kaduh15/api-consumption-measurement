import { Router } from 'express'
import z from 'zod'

import { db } from '@/libs/prisma'
import { HttpStatus } from '@/utils/http-status'

const confirmValueRouter: Router = Router()

const bodySchema = z
  .object({
    measure_uuid: z.string().uuid(),
    confirmed_value: z.coerce.number(),
  })
  .transform((data) => ({
    confirmedValue: data.confirmed_value,
    measureUUID: data.measure_uuid,
  }))

confirmValueRouter.patch('/confirm', async (req, res) => {
  const payload = bodySchema.safeParse(req.body)

  if (!payload.success) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error_code: 'INVALID_DATA',
      error_description:
        'Os dados fornecidos no corpo da requisição são inválidos.',
    })
  }

  const { confirmedValue, measureUUID } = payload.data

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

  res.status(HttpStatus.OK).json({
    success: true,
  })
})

export { confirmValueRouter }
