# Stage 1: Build
FROM node:23 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig*.json tsup*.ts ./
COPY server ./server
RUN npm run build:server

# Stage 2: Production
FROM node:23-alpine

ARG APP_VERSION

WORKDIR /app
COPY --from=build /app/dist-server/ /app/dist-server/
COPY server/migrations/ /app/server/migrations/
COPY package*.json ./
RUN npm ci --omit=dev

USER 1000
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
EXPOSE 3000
CMD ["node", "dist-server/start.cjs"]
