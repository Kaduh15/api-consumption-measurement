import cors from 'cors'
import express from 'express'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

import 'express-async-errors'

import { env } from '@/config/env'
import errorMiddleware from '@/middlewares/error.middleware'
import {
  updateImageRoute,
  getImageTempRoute,
  confirmValueRouter,
  getCustomerMeasureRouter,
} from '@/routes'

const swaggerPath = path.resolve(__dirname, '../docs/swagger.yaml')
const swaggerDocument = YAML.load(swaggerPath)

class App {
  public app: express.Express

  constructor() {
    this.app = express()

    this.config()
    this.routes()
  }

  private config(): void {
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      }),
    )
    this.app.use(
      express.json({
        limit: '50mb',
      }),
    )
    // this.app.use(loggerMiddleware)
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  }

  private routes(): void {
    this.app.get('/docs', swaggerUi.setup(swaggerDocument))

    this.app.use(updateImageRoute)
    this.app.use(getImageTempRoute)
    this.app.use(confirmValueRouter)
    this.app.use(getCustomerMeasureRouter)

    this.app.use('*', (req, res) => {
      const url =
        env.URL_DEPLOY ||
        req.protocol + '://' + req.get('host') + ':' + env.PORT

      res.status(404).json({
        message: `Route not found, go to ${url}/docs to see available routes`,
      })
    })

    this.app.use(errorMiddleware)
  }

  public start(PORT: string | number): void {
    this.app.listen(PORT, () => console.log(`Running on port ${PORT}`))
  }
}

export { App }

// A execução dos testes de cobertura depende dessa exportação
export const { app } = new App()
