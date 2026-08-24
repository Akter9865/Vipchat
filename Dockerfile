# Multi-Stage Production Dockerfile for VIPChat Live CRM
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools & openssl for Prisma
RUN apk add --no-cache openssl python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and prisma schema
COPY prisma ./prisma
COPY server ./server
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build frontend and backend bundles
RUN npm run build

# -------------------------------------------------------------
# Production Runner Stage
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma engine runtime
RUN apk add --no-cache openssl bash curl

ENV NODE_ENV=production
ENV PORT=3000
ENV STORAGE_PATH=/app/storage/uploads

# Create directories for persistent storage
RUN mkdir -p /app/storage/uploads/images \
             /app/storage/uploads/videos \
             /app/storage/uploads/audio \
             /app/storage/uploads/documents \
             /app/storage/uploads/others

# Copy package.json and install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy generated prisma client and schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy built frontend & server bundle
COPY --from=builder /app/dist ./dist

# Copy startup scripts
COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh 2>/dev/null || true

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start command
CMD ["node", "dist/server.js"]
