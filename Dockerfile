FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@latest

COPY package.json  pnpm-lock.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

CMD ["pnpm", "dev"]