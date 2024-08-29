import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: 'v8',
    },
    env: {
      DATABASE_URL: 'postgresql://root:root@db:5432/mydb?schema=public',
      GEMINI_API_KEY: 'GEMINI_API_KEY',
      POSTGRES_DB: 'mydb',
      POSTGRES_HOST: 'db',
      POSTGRES_PASSWORD: 'root',
      POSTGRES_PORT: 5432,
      POSTGRES_USER: 'root',
      PORT: 3000,
      URL_DEPLOY: 'http://localhost:3000',
    },
  },
})
