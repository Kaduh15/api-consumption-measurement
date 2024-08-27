import { App } from '@/app'
import { env } from '@/config/env'

new App().start(env.PORT)
