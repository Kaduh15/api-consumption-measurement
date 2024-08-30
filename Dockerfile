FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@latest

COPY package.json  pnpm-lock.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY ./src ./src
COPY ./prisma ./prisma
COPY ./docs ./docs

RUN pnpm build

CMD ["pnpm", "dev"]