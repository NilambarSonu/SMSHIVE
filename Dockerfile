# ── STAGE 1: Build API ──
FROM node:20-alpine AS api-builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY web/shared-types ./web/shared-types
COPY web/api ./web/api
RUN npm ci
WORKDIR /app/web/api
RUN npm run build

# ── STAGE 2: Build Dashboard ──
FROM node:20-alpine AS dashboard-builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY web/shared-types ./web/shared-types
COPY web/dashboard ./web/dashboard
RUN npm ci
WORKDIR /app/web/dashboard
ENV NEXT_TELEMETRY_DISABLED=1
# For single-repo deploy, the API is on the same domain
ENV NEXT_PUBLIC_API_URL=/ 
RUN npm run build

# ── STAGE 3: Final Production Image ──
FROM node:20-alpine AS runner
WORKDIR /app

# Install NGINX and Supervisor
RUN apk add --no-cache nginx supervisor

# Copy API
WORKDIR /app/api
COPY --from=api-builder /app/web/api/dist ./dist
COPY --from=api-builder /app/web/api/node_modules ./node_modules
COPY --from=api-builder /app/web/api/package.json ./package.json

# Copy Dashboard (Standalone)
WORKDIR /app/dashboard
COPY --from=dashboard-builder /app/web/dashboard/public ./public
COPY --from=dashboard-builder /app/web/dashboard/.next/standalone/web/dashboard ./
COPY --from=dashboard-builder /app/web/dashboard/.next/standalone/node_modules ./node_modules
COPY --from=dashboard-builder /app/web/dashboard/.next/static ./.next/static

# Setup NGINX and Supervisor config
COPY deployment/nginx.conf /etc/nginx/http.d/default.conf
COPY deployment/supervisord.conf /etc/supervisord.conf

# Render uses port 10000 by default if not specified, 
# but NGINX is listening on 80. We'll tell NGINX to listen on $PORT.
RUN sed -i 's/listen 80;/listen 10000;/' /etc/nginx/http.d/default.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
