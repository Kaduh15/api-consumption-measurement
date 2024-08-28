import { Router } from 'express'

import { db } from '@/libs/prisma'
import { HttpStatus } from '@/utils/http-status'

const getImageTempRoute: Router = Router()

getImageTempRoute.get('/image/:id', async (req, res) => {
  const { id } = req.params

  const image = await db.measure.findUnique({
    where: {
      id,
    },
    select: {
      imageBase64: true,
    },
  })

  if (!image) {
    return res.status(HttpStatus.NOT_FOUND).json({
      error_code: 'MEASURE_NOT_FOUND',
      error_description: 'A image medição não foi encontrada ou expirou',
    })
  }

  const imageBuffer = Buffer.from(image.imageBase64, 'base64')
  res.writeHead(HttpStatus.OK, { 'Content-Type': 'image/png' })
  res.end(imageBuffer)
})

export { getImageTempRoute }
