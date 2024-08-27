import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { HttpError } from '@/utils/http-errors'
import { HttpStatus } from '@/utils/http-status'

export default function errorMiddleware(
  error: HttpError | ZodError,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.log('🚀 ~ error:', error)
  if (error instanceof ZodError) {
    console.log(error)

    const errors: {
      [k: string]: string
    } = {}

    error.issues.forEach((issue) => {
      errors[issue.path[0]] = issue.message
    })

    return response.status(HttpStatus.BAD_REQUEST).json({ errors })
  }

  if (error instanceof HttpError) {
    const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
    const message = error.message || 'Something went wrong'

    response.status(status).send({
      error: message,
    })

    return
  }

  response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    error: 'Something went wrong',
  })
}
