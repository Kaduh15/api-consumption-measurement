import { Router } from 'express'
import z from 'zod'

import { env } from '@/config/env'
import { db } from '@/libs/prisma'
import { getStartAndEndDate } from '@/utils/get-startand-enddate'
import { HttpStatus } from '@/utils/http-status'

const getCustomerMeasureRouter: Router = Router()

const paramsSchema = z
  .object({
    customer_code: z.string(),
  })
  .transform((data) => ({
    customerCode: data.customer_code,
  }))

const querySchema = z
  .object({
    measure_type: z
      .enum(['WATER', 'GAS'])
      .optional()
      .refine((value) => {
        if (value) {
          return ['WATER', 'GAS'].includes(value.toUpperCase())
        }

        return true
      }),
    measure_datetime: z.coerce.date().optional(),
  })
  .transform((data) => ({
    measureType: data.measure_type,
    measureDatetime: data.measure_datetime?.toISOString(),
  }))

type MeasureDB = {
  id: string
  measureValue: number
  measureDatetime: Date
  measureType: 'WATER' | 'GAS'
  customerCode: string
  hasConfirmed: boolean
  imageBase64: string
}

type Measure = {
  measure_uuid: string
  measure_datetime: Date
  measure_value: number
  measure_type: string
  has_confirmed: boolean
  image_url: string
}

type CustomerMeasure = {
  customer_code: string
  measures: Measure[]
}

getCustomerMeasureRouter.get('/:customer_code/list', async (req, res) => {
  const payload = paramsSchema.safeParse(req.params)

  if (!payload.success) {
    const message = payload.error.issues.map(
      (issue) => `${issue.path[0]}: ${issue.message}`,
    )[0]

    if (payload.error?.issues[0]?.path.includes('measure_type')) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error_code: 'INVALID_TYPE',
        error_description: 'Tipo de medição não permitida',
      })
    }

    return res.status(HttpStatus.BAD_REQUEST).json({
      error_code: 'INVALID_DATA',
      error_description:
        message || 'Os dados fornecidos no corpo da requisição são inválidos.',
    })
  }

  const { customerCode } = payload.data

  const query = querySchema.safeParse(req.query)

  if (query.success) {
    const { measureDatetime, measureType } = query.data

    let queryDatetime

    if (measureDatetime) {
      const { startDate, endDate } = getStartAndEndDate(measureDatetime)

      queryDatetime = {
        gte: startDate,
        lte: endDate,
      }
    }

    const data = await db.measure.findMany({
      where: {
        customerCode,
        measureType,
        measureDatetime: queryDatetime,
      },
    })

    const result = formatResponse(data)

    return res.status(HttpStatus.OK).json(result)
  }

  const data = await db.measure.findMany({
    where: {
      customerCode,
    },
  })

  if (data.length === 0) {
    return res.status(HttpStatus.NOT_FOUND).json({
      error_code: 'MEASURES_NOT_FOUND',
      error_description: 'O código do cliente não foi encontrado',
    })
  }

  const result = formatResponse(data)

  res.status(HttpStatus.OK).json(result)
})

const formatResponse = (measures: MeasureDB[]): CustomerMeasure => {
  if (measures.length === 0) {
    return {
      customer_code: '',
      measures: [],
    }
  }

  const measuresFormatted = measures.map((measure) => ({
    measure_uuid: measure.id,
    measure_datetime: measure.measureDatetime,
    measure_value: measure.measureValue,
    measure_type: measure.measureType,
    has_confirmed: measure.hasConfirmed,
    image_url: `${env.URL_DEPLOY}/api/image/${measure.id}`,
  }))

  return {
    customer_code: measures[0].customerCode,
    measures: measuresFormatted,
  }
}

export { getCustomerMeasureRouter }
