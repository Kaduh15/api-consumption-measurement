import Sinon from 'sinon'
import supertest from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { app } from '@/app'
import { env } from '@/config/env'
import { db } from '@/libs/prisma'

const request = supertest(app)

describe('/<customerCode>/list', () => {
  beforeEach(() => {
    Sinon.restore()
  })

  it('should return an error if the “measure type” is different from WATER or GAS.', async () => {
    db.measure.findMany = Sinon.stub().resolves([])

    const response = await request.get(
      '/api/customerCode/list?measure_type=OTHER',
    )

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      error_code: 'INVALID_TYPE',
      error_description: 'Tipo de medição não permitida',
    })
  })

  it('Should return success set of "measure type" to upper and lower case', async () => {
    db.measure.findMany = Sinon.stub().resolves([
      {
        id: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
      },
    ])

    const response = await request.get(
      '/api/customerCode/list?measure_type=water',
    )

    expect(response.statusCode).toBe(200)
  })

  it('Should return an error if customerCode is not found', async () => {
    db.measure.findMany = Sinon.stub().resolves([])

    const response = await request.get('/api/customerCode/list')

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error_code: 'MEASURES_NOT_FOUND',
      error_description: 'Nenhuma leitura encontrada',
    })
  })

  it('Should return an success message if customerCode is found', async () => {
    const measure = {
      id: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
      measureDatetime: '2024-08-27T10:00:00Z',
      measureValue: 150,
      measureType: 'WATER',
      customerCode: '12345',
      hasConfirmed: true,
      imageBase64: 'imageBase64',
    }

    db.measure.findMany = Sinon.stub().resolves([measure])

    const response = await request.get('/api/customerCode/list')

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      customer_code: '12345',
      measures: [
        {
          measure_uuid: measure.id,
          measure_datetime: measure.measureDatetime,
          measure_type: measure.measureType,
          has_confirmed: measure.hasConfirmed,
          image_url: `${env.URL_DEPLOY}/api/image/${measure.id}`,
        },
      ],
    })
  })
})
