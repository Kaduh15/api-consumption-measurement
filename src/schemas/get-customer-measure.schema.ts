import z from 'zod'

export const getCustomerMeasureParamsSchema = z
  .object({
    customer_code: z.string({
      message: 'Insira um código de cliente válido',
    }),
  })
  .transform((data) => ({
    customerCode: data.customer_code,
  }))

export type GetCustomerMeasureParamsSchema = z.infer<
  typeof getCustomerMeasureParamsSchema
>

const measureTypes = ['WATER', 'GAS'] as const
type MeasureType = (typeof measureTypes)[number]

const measureTypeSchema = z
  .string()
  .refine(
    (value) => measureTypes.includes(value.toUpperCase() as MeasureType),
    {
      message: 'INVALID_TYPE: Tipo de medição não permitida',
    },
  )
  .transform((value) => value.toUpperCase() as MeasureType)

export const getCustomerMeasureQuerySchema = z
  .object({
    measure_type: measureTypeSchema.optional(),
    measure_datetime: z.coerce.date().optional(),
  })
  .transform((data) => {
    return {
      measureType: data.measure_type,
      measureDatetime: data.measure_datetime?.toISOString(),
    }
  })

export type GetCustomerMeasureQuerySchema = z.infer<
  typeof getCustomerMeasureQuerySchema
>
