import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

type RequestSchema = {
  body?: ZodType
  query?: ZodType
  params?: ZodType
}

type ValidationErrors = {
  body?: { [key: string]: string }
  query?: { [key: string]: string }
  params?: { [key: string]: string }
}

export default function requestValidationMiddleware(schema: RequestSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationErrors = {}

    const validateField = (key: keyof RequestSchema, zodSchema?: ZodType) => {
      if (zodSchema) {
        const validation = zodSchema.safeParse(req[key])
        if (!validation.success) {
          validation.error.issues.forEach((issue) => {
            if (!errors[key]) {
              errors[key] = {}
            }
            errors[key][issue.path[0]] = issue.message
          })
        }
        req[key] = validation.data // This should be safe now
      }
    }

    validateField('body', schema.body)
    validateField('query', schema.query)
    validateField('params', schema.params)

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors })
    }

    return next()
  }
}
