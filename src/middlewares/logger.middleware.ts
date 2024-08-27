import { NextFunction, Request, Response } from 'express'

export default function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.url.includes('docs')) {
    return next()
  }
  console.log(req.method, req.url)
  next()
}
