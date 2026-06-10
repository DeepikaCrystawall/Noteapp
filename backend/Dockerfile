FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./

FROM base AS dependencies
RUN npm ci --only=production

FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["dumb-init", "node", "--watch", "src/server.js"]

FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN mkdir -p uploads logs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["dumb-init", "node", "src/server.js"]
