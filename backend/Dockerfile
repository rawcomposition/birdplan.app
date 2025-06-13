FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY backend ./backend
COPY shared ./shared

WORKDIR /app/backend
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 honojs \
  && adduser --system --uid 1001 appuser

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

USER appuser

EXPOSE 5100

CMD ["node", "--require", "dotenv/config", "dist/backend/src/index.js"]
