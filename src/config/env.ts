import z from 'zod'

export const env = z
  .object({
    PORT: z.coerce.number().default(3000),
    GEMINI_API_KEY: z.string(),
    URL_DEPLOY: z.string().default('http://localhost:3000'),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number().optional(),
    POSTGRES_DB: z.string(),
  })
  .transform((env) => ({
    ...env,
    DATABASE_URL: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT ?? 5432}/${env.POSTGRES_DB}?schema=public`,
  }))
  .parse(process.env)
