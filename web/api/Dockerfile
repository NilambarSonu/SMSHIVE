# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configs
COPY package.json package-lock.json ./

# Copy the shared package and dashboard/api
COPY web/shared-types ./web/shared-types
COPY web/api ./web/api

# Install dependencies for the whole workspace
RUN npm ci

# Build the API
WORKDIR /app/web/api
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built files and production node_modules
COPY --from=builder /app/web/api/dist ./dist
COPY --from=builder /app/web/api/node_modules ./node_modules
COPY --from=builder /app/web/api/package.json ./package.json

EXPOSE 8000
CMD ["node", "dist/main"]
