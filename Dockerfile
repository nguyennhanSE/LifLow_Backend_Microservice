FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
RUN apk update && apk add --no-cache bash
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ttf-freefont \
  ttf-dejavu \
  fontconfig \
  font-noto \
  font-noto-cjk \
  ca-certificates && \
  fc-cache -f -v

# Copy source and build
COPY . .
RUN PRISMA_SERVICE=api-gateway npx prisma generate && \
    PRISMA_SERVICE=identity-service npx prisma generate && \
    PRISMA_SERVICE=loyalty-service npx prisma generate && \
    PRISMA_SERVICE=nutrition-service npx prisma generate && \
    PRISMA_SERVICE=chat-service npx prisma generate && \
    PRISMA_SERVICE=notification-service npx prisma generate

RUN npx nest build api-gateway && \
    npx nest build identity-service && \
    npx nest build loyalty-service && \
    npx nest build nutrition-service && \
    npx nest build chat-service && \
    npx nest build notification-service

# Prune dev dependencies for runtime image
RUN npm prune --production

# ===== RUNTIME =====
FROM node:22-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3500

# Install PM2 globally
RUN npm install pm2 -g

# Install system dependencies (postgresql-client and fonts/chromium)
RUN apk update && \
    apk add --no-cache \
      postgresql-client \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ttf-freefont \
      ttf-dejavu \
      fontconfig \
      font-noto \
      font-noto-cjk \
      ca-certificates && \
    fc-cache -f -v || true
# Copy production deps, build output, and prisma schema (with generated client)
COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/libs/prisma ./libs/prisma
COPY --from=builder /usr/src/app/proto ./proto
COPY prisma.config.ts ./prisma.config.ts


EXPOSE 3500 3501 3502 3503 3504 3505 50051 50052 50053 50054 50055 50056

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_DOWNLOAD=true
CMD ["sh", "-c", "npm run db:deploy && pm2-runtime dist/src/main.js --name nestjs-app"]
