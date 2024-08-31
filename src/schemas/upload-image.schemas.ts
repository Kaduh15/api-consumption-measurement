import z from 'zod'

export const bodySchema = z
  .object({
    image: z
      .string()
      .refine((image) => {
        try {
          Buffer.from(image, 'base64')
          return true
        } catch (error) {
          return false
        }
      })
      .transform((image) =>
        image.replace(/^data:image\/[^;]+;base64,[^\s]+/, ''),
      ),
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
