import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

type RequestSchema = {
  body?: ZodType
  query?: ZodType
  params?: ZodType
}

export default function requestValidationMiddleware(schema: RequestSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validateField = (key: keyof RequestSchema, zodSchema?: ZodType) => {
      if (zodSchema) {
        const data = zodSchema.parse(req[key])
        req[key] = data
      }
    }

    validateField('body', schema.body)
    validateField('query', schema.query)
    validateField('params', schema.params)

    return next()
  }
}
