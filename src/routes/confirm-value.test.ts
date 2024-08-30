import Sinon from 'sinon'
import supertest from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { app } from '@/app'
import { db } from '@/libs/prisma'

const request = supertest(app)

describe('/confirm', async () => {
  beforeEach(() => {
    Sinon.restore()
  })

  it('Should return an error if the request body is invalid', async () => {
    const bodyRequest = {
      confirmed_value: 0,
      measure_uuid: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
    }

    for (const key in bodyRequest) {
      const response = await request.patch('/api/confirm').send({
        ...bodyRequest,
        [key]: undefined,
      })

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({
        error_code: 'INVALID_DATA',
        error_description:
          'Os dados fornecidos no corpo da requisição são inválidos.',
      })
    }
  })

  it('should return an error if the "measure_uuid" to send does not exist', async () => {
    const bodyRequest = {
      confirmed_value: 0,
      measure_uuid: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
    }

    db.measure.findUnique = Sinon.stub().resolves(null)

    const response = await request.patch('/api/confirm').send(bodyRequest)

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error_code: 'MEASURE_NOT_FOUND',
      error_description: 'Leitura do mês não encontrada',
    })
  })

  it('should return one if the "measure_uuid" has already been confirmed', async () => {
    const bodyRequest = {
      confirmed_value: 0,
      measure_uuid: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
    }

    db.measure.findUnique = Sinon.stub().resolves({
      hasConfirmed: true,
    })

    const response = await request.patch('/api/confirm').send(bodyRequest)

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error_code: 'CONFIRMATION_DUPLICATE',
      error_description: 'Leitura do mês já realizada',
    })
  })

  it('Should return success if the "measure_uuid" has been confirmed', async () => {
    const bodyRequest = {
      confirmed_value: 0,
      measure_uuid: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
    }

    db.measure.findUnique = Sinon.stub().resolves({
      hasConfirmed: false,
    })

    db.measure.update = Sinon.stub().resolves({
      hasConfirmed: true,
    })

    const response = await request.patch('/api/confirm').send(bodyRequest)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      success: true,
    })
  })
})
