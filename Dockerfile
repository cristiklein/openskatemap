# Stage 1: Build
FROM node:23 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY server ./server
RUN npm run build:server

# Stage 2: Production
FROM node:23-slim

WORKDIR /app
COPY --from=build /app/dist/server ./dist/server
COPY package*.json ./
RUN npm ci --omit=dev

USER 1000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server/start.js"]
