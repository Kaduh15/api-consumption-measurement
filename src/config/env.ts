import z from 'zod'

export const env = z
  .object({
    PORT: z.coerce.number().default(3000),
    GEMINI_API_KEY: z.string({
      description: 'API key do Google Gemini',
      required_error: 'GEMINI_API_KEY is required',
    }),
    URL_DEPLOY: z.string().optional(),
  })
  .parse(process.env)
