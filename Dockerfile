# ── STAGE 1: Build Everything ──
FROM node:20 AS builder
WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY web/shared-types ./web/shared-types
COPY web/api ./web/api
COPY web/dashboard ./web/dashboard

# Install all dependencies
RUN npm ci

# Build shared types first
WORKDIR /app/web/shared-types
RUN npm run build

# Build API
WORKDIR /app/web/api
RUN npm run build

# Build Dashboard
WORKDIR /app/web/dashboard
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=/ 
RUN npm run build

# ── STAGE 2: Final Production Image ──
FROM node:20-slim AS runner
WORKDIR /app

# Install NGINX and Supervisor
RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*

# Copy built API
WORKDIR /app/api
COPY --from=builder /app/web/api/dist ./dist
COPY --from=builder /app/web/api/node_modules ./node_modules
COPY --from=builder /app/web/api/package.json ./package.json

# Copy built Dashboard (Standalone)
WORKDIR /app/dashboard
COPY --from=builder /app/web/dashboard/public ./public
COPY --from=builder /app/web/dashboard/.next/standalone/web/dashboard ./
COPY --from=builder /app/web/dashboard/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/web/dashboard/.next/static ./.next/static

# Setup NGINX and Supervisor config
COPY deployment/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
COPY deployment/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Map NGINX to Render's internal port
RUN sed -i 's/listen 80;/listen 10000;/' /etc/nginx/sites-available/default
EXPOSE 10000

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
