# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for build caching)
COPY package*.json ./
RUN npm ci

# Copy source code and config files
COPY . .

# Generate Prisma client and build Next.js application
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy files required to run in production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/server.js ./server.js

# Expose Next.js custom server port
EXPOSE 3001

# Run migrations and start the custom server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
