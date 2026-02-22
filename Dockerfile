# ── Stage 1: Build ────────────────────────────────────────────────
FROM oven/bun:1 AS build

WORKDIR /app

# Copy dependency manifests first (cache layer)
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies for the build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set production env vars at build time so Vite can inline them
ARG VITE_CONVEX_URL
ARG VITE_CONVEX_SITE_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_ORG
ARG VITE_SENTRY_PROJECT
ARG VITE_LIVEKIT_WS_URL
ARG VITE_SITE_URL

ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_SENTRY_ORG=$VITE_SENTRY_ORG
ENV VITE_SENTRY_PROJECT=$VITE_SENTRY_PROJECT
ENV VITE_LIVEKIT_WS_URL=$VITE_LIVEKIT_WS_URL
ENV VITE_SITE_URL=$VITE_SITE_URL

# Build with vite directly
RUN bunx vite build

# Copy custom Node.js server adapter into the dist
RUN cp src/node-server.mjs dist/server/node-server.mjs

# ── Stage 2: Runtime ──────────────────────────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

# Copy the build output (dist/server + dist/client)
COPY --from=build /app/dist ./dist

# Copy production node_modules (server.js has external deps)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Cloud Run uses PORT env var (default 8080)
ENV PORT=8080
EXPOSE 8080

# Start the custom Node.js adapter (wraps TanStack Start's fetch handler)
CMD ["node", "dist/server/node-server.mjs"]
