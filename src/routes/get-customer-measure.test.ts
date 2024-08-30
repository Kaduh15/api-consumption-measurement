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
})
