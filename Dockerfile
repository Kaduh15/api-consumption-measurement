FROM node:20-alpine as build

WORKDIR /app

COPY package.json tsconfig.json ./

RUN npm install --omit=prod

COPY src ./src

RUN npm run build

RUN npm run db:migrate && npm run db:generate

CMD [ "npm", "run", "start" ]