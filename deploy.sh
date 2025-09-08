#!/bin/bash

#!/usr/bin/env bash
set -euo pipefail

# Minimal Vercel deploy wrapper (expects project already linked)
# Environment variables (Supabase URL/keys) should be configured in Vercel dashboard.

REPO_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$REPO_DIR"

echo "🔁 Cleaning local Vercel metadata..."
rm -rf .vercel 2>/dev/null || true

echo "🚀 Deploying to Vercel (production)..."
npx vercel --prod --yes --confirm

echo "✅ Deploy triggered. Check Vercel dashboard for status."
