FROM node:20-alpine as build

WORKDIR /app

COPY package.json tsconfig.json ./

RUN npm install --omit=prod

COPY src ./src

RUN npm run build

FROM node:20-alpine as production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

COPY /docs ./docs

RUN npm install --omit=dev

CMD ["node", "dist/server.js"]