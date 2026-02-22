#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────
PROJECT_ID="gen-lang-client-0558867015"
REGION="europe-west1"
SERVICE_NAME="consulat-ga"
REPO="europe-west1-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy"
IMAGE="${REPO}/consulat-ga:latest"

# ─── Production VITE_ build-time variables ────────────────────────
# These get inlined by Vite at build time.
VITE_CONVEX_URL="https://usable-mole-795.eu-west-1.convex.cloud"
VITE_CONVEX_SITE_URL="https://usable-mole-795.eu-west-1.convex.site"
VITE_SITE_URL="https://consulat.ga"
VITE_STRIPE_PUBLISHABLE_KEY="${VITE_STRIPE_PUBLISHABLE_KEY:-}"
VITE_SENTRY_DSN="${VITE_SENTRY_DSN:-}"
VITE_SENTRY_ORG="${VITE_SENTRY_ORG:-}"
VITE_SENTRY_PROJECT="${VITE_SENTRY_PROJECT:-}"
VITE_LIVEKIT_WS_URL="${VITE_LIVEKIT_WS_URL:-}"

echo "🔨 Building Docker image…"
docker build \
  --platform linux/amd64 \
  --build-arg VITE_CONVEX_URL="${VITE_CONVEX_URL}" \
  --build-arg VITE_CONVEX_SITE_URL="${VITE_CONVEX_SITE_URL}" \
  --build-arg VITE_SITE_URL="${VITE_SITE_URL}" \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY="${VITE_STRIPE_PUBLISHABLE_KEY}" \
  --build-arg VITE_SENTRY_DSN="${VITE_SENTRY_DSN}" \
  --build-arg VITE_SENTRY_ORG="${VITE_SENTRY_ORG}" \
  --build-arg VITE_SENTRY_PROJECT="${VITE_SENTRY_PROJECT}" \
  --build-arg VITE_LIVEKIT_WS_URL="${VITE_LIVEKIT_WS_URL}" \
  -t "${IMAGE}" \
  .

echo "📦 Pushing image to Artifact Registry…"
docker push "${IMAGE}"

echo "🚀 Deploying to Cloud Run…"
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${IMAGE}" \
  --port=8080 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="IDN_CLIENT_ID=${IDN_CLIENT_ID:-}" \
  --set-env-vars="IDN_CLIENT_SECRET=${IDN_CLIENT_SECRET:-}" \
  --set-env-vars="IDN_DISCOVERY_URL=${IDN_DISCOVERY_URL:-}" \
  --set-env-vars="LIVEKIT_API_KEY=${LIVEKIT_API_KEY:-}" \
  --set-env-vars="LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET:-}" \
  --min-instances=0 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1

echo ""
echo "✅ Deployment complete!"
gcloud run services describe "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --format="value(status.url)"
