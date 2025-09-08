#!/bin/bash

#!/usr/bin/env bash
set -euo pipefail

# Minimal Vercel deploy wrapper (expects project already linked)
# Environment variables (Supabase URL/keys) should be configured in Vercel dashboard.

REPO_DIR=$(cd "$(dirname "$0")" && pwd)
APP_DIR="$REPO_DIR/gymtopia-app"
cd "$APP_DIR"

echo "ℹ️ Using existing Vercel project link if present (.vercel)"

SUPA_URL=$(awk -F= '/^NEXT_PUBLIC_SUPABASE_URL/ {print $2}' .env.local | tr -d '\r' || true)
SUPA_ANON=$(awk -F= '/^NEXT_PUBLIC_SUPABASE_ANON_KEY/ {print $2}' .env.local | tr -d '\r' || true)

echo "🚀 Deploying to Vercel (production)..."
if [ -n "$SUPA_URL" ] && [ -n "$SUPA_ANON" ]; then
  echo "🔐 Passing Supabase build env from .env.local"
  npx vercel --prod --yes --confirm \
    --build-env NEXT_PUBLIC_SUPABASE_URL="$SUPA_URL" \
    --build-env NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPA_ANON"
else
  echo "⚠️ Supabase env not found locally; relying on Vercel dashboard env"
  npx vercel --prod --yes --confirm
fi

echo "✅ Deploy triggered. Check Vercel dashboard for status."
