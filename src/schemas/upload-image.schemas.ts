import { z } from 'zod'

const isValidBase64Image = (value: string) => {
  try {
    Buffer.from(value, 'base64')
    return true
  } catch {
    return false
  }
}

const isValidDate = (value: string) => {
  try {
    const date = new Date(value)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

export const updateImageBodySchema = z
  .object({
    image: z
      .string({
        message: 'Insira uma imagem válida',
      })
      .refine(isValidBase64Image, {
        message: 'Insira uma imagem válida',
      })
      .transform((image) => image.replace(/^data:image\/[^;]+;base64,/, '')), // Remove o prefixo base64

    customer_code: z.string({
      message: 'Insira um código de cliente válido',
    }),

    measure_datetime: z
      .string({ message: 'Data inválida, insira uma data válida' })
      .refine(isValidDate, {
        message: 'Data inválida, insira uma data válida',
        path: ['measure_datetime'],
      })
      .transform((date) => new Date(date).toISOString()),

    measure_type: z.enum(['WATER', 'GAS'], {
      message: 'Tipo de medição inválido, insira WATER ou GAS',
    }),
  })
  .transform((data) => ({
    image: data.image,
    customerCode: data.customer_code,
    measureDatetime: data.measure_datetime,
    measureType: data.measure_type,
  }))

export type UpdateImageBodySchema = z.infer<typeof updateImageBodySchema>
