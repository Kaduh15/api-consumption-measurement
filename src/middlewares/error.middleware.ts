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
  if (error instanceof ZodError) {
    const currentError = error.errors[0]
    const { errorCode, errorMessage } = extractErrorMessageAndCode(
      currentError.message,
    )
    return response.status(HttpStatus.BAD_REQUEST).json({
      error_code: errorCode,
      error_description: errorMessage,
    })
  }

  if (error instanceof HttpError) {
    const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
    const message = error.message || 'Something went wrong'

    response.status(status).send({
      error: message,
    })

    return
  }

  return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    error: 'Something went wrong',
  })
}

function extractErrorMessageAndCode(error: string) {
  const spitedError = error.split(':').map((text) => text.trim())

  if (spitedError.length === 1) {
    return {
      errorCode: 'INVALID_DATA',
      errorMessage: spitedError[0],
    }
  }

  return {
    errorCode: spitedError[0],
    errorMessage: spitedError[1],
  }
}
