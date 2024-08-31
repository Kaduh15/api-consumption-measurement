import z from 'zod'

export const confirmValueBodySchema = z
  .object({
    measure_uuid: z
      .string({
        message: 'UUID Invalido',
      })
      .uuid(),
    confirmed_value: z.coerce.number({
      message: 'Insira um valor válido',
    }),
  })
  .transform((data) => ({
    confirmedValue: data.confirmed_value,
    measureUUID: data.measure_uuid,
  }))

export type ConfirmValueBodySchemaType = z.infer<typeof confirmValueBodySchema>
