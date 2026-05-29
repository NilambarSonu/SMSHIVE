# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configs
COPY package.json package-lock.json ./

# Copy required web packages
COPY web/shared-types ./web/shared-types
COPY web/dashboard ./web/dashboard

# Install dependencies
RUN npm ci

# Build the dashboard
WORKDIR /app/web/dashboard
ENV NEXT_TELEMETRY_DISABLED=1
# Important: Pass the API URL during build time for Next.js env injection
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output doesn't include static files by default
COPY --from=builder /app/web/dashboard/public ./public
COPY --from=builder /app/web/dashboard/.next/standalone/web/dashboard ./
COPY --from=builder /app/web/dashboard/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/web/dashboard/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
