import { Router } from 'express'

import { env } from '@/config/env'
import { db } from '@/libs/prisma'
import requestValidationMiddleware from '@/middlewares/request-validate.middleware'
import {
  getCustomerMeasureParamsSchema,
  GetCustomerMeasureParamsSchema,
  GetCustomerMeasureQuerySchema,
  getCustomerMeasureQuerySchema,
} from '@/schemas/get-customer-measure.schema'
import { getStartAndEndDate } from '@/utils/get-startand-enddate'
import { HttpStatus } from '@/utils/http-status'

const getCustomerMeasureRouter: Router = Router()

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

getCustomerMeasureRouter.get(
  '/:customer_code/list',
  requestValidationMiddleware({
    params: getCustomerMeasureParamsSchema,
    query: getCustomerMeasureQuerySchema,
  }),
  async (req, res) => {
    const { customerCode } = req.params as GetCustomerMeasureParamsSchema

    const { measureDatetime, measureType } =
      req.query as GetCustomerMeasureQuerySchema

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

    if (data.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      })
    }

    const result = formatResponse(data)

    return res.status(HttpStatus.OK).json(result)
  },
)

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
