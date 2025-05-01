FROM node:23-slim

# Setup dependencies
USER 1000
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
COPY . .

# Test
RUN \
  npm run dev:server & \
  sleep 1 && \
  npm run test && \
  ls -l /tmp

# Run
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=info
ENV NPM_CONFIG_LOGSTREAM=stdout
EXPOSE 3000
CMD ["npm", "start" ]
