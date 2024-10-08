import Sinon from 'sinon'
import supertest from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { app } from '@/app'
import { env } from '@/config/env'
import { model } from '@/libs/google-ai'
import { db } from '@/libs/prisma'

const request = supertest(app)

describe('/upload', () => {
  beforeEach(() => {
    Sinon.restore()
  })

  it('should record a successful measurement', async () => {
    const bodyRequest = {
      image: 'aW1hZ2VCYXNlNjQ=',
      customer_code: 'customerCode',
      measure_type: 'WATER',
      measure_datetime: '2023-01-01T00:00:00.000Z',
    }

    db.measure.findFirst = Sinon.stub().resolves(null)

    model.generateContent = Sinon.stub().resolves({
      response: {
        text: Sinon.stub().returns('{"value": "10"}'),
      },
    })

    db.measure.create = Sinon.stub().resolves({
      id: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
      customerCode: 'customerCode',
      hasConfirmed: false,
      imageBase64: 'imageBase64',
      measureDatetime: new Date('2023-01-01T00:00:00.000Z'),
      measureValue: 10,
      measureType: 'WATER',
    })

    const response = await request.post('/api/upload').send(bodyRequest)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      image_url: `${env.URL_DEPLOY}/api/image/d9e4dcfe-60b8-4826-a5d7-101ee916e891`,
      measure_value: 10,
      measure_uuid: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
    })
  })

  it('Should return an error if the request body is invalid', async () => {
    const bodyRequest = {
      image: 'aW1hZ2VCYXNlNjQ=',
      customer_code: 'customerCode',
      measure_type: 'WATER',
      measure_datetime: '2023-01-01T00:00:00.000Z',
    }

    const errorsMessages: {
      [key: string]: string
    } = {
      image: 'Insira uma imagem válida',
      customer_code: 'Insira um código de cliente válido',
      measure_type: 'Tipo de medição inválido, insira WATER ou GAS',
      measure_datetime: 'Data inválida, insira uma data válida',
    }

    for (const key in bodyRequest) {
      const response = await request.post('/api/upload').send({
        ...bodyRequest,
        [key]: undefined,
      })

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({
        error_code: 'INVALID_DATA',
        error_description: errorsMessages[key],
      })
    }
  })

  it('Should return an error if the image is invalid', async () => {
    const bodyRequest = {
      image: 'aW1hZ2VCYXNlNjQ=',
      customer_code: 'customerCode',
      measure_type: 'WATER',
      measure_datetime: '2023-01-01',
    }

    db.measure.findFirst = Sinon.stub().resolves(null)

    model.generateContent = Sinon.stub().resolves({
      response: {
        text: Sinon.stub().returns('Invalid image'),
      },
    })

    const response = await request.post('/api/upload').send(bodyRequest)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({
      error_code: 'INVALID_DATA',
      error_description: 'Não foi possível analisar a imagem.',
    })
  })

  it('should return one if there is already a measurement in the same month', async () => {
    const bodyRequest = {
      image: 'aW1hZ2VCYXNlNjQ=',
      customer_code: 'customerCode',
      measure_type: 'WATER',
      measure_datetime: '2023-01-01T00:00:00.000Z',
    }

    db.measure.findFirst = Sinon.stub().resolves({
      id: 'd9e4dcfe-60b8-4826-a5d7-101ee916e891',
    })

    const response = await request.post('/api/upload').send(bodyRequest)
    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error_code: 'DOUBLE_REPORT',
      error_description: 'Leitura do mês já realizada',
    })
  })
})
