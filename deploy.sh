#!/bin/bash

# Vercel deployment script
cd /Users/tsubasa/GYMTOPIA2.0

# Clean previous deployment
rm -rf .vercel

# Deploy to Vercel
npx vercel --prod --yes \
  --build-env NEXT_PUBLIC_SUPABASE_URL="your_supabase_url" \
  --build-env NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key" \
  --scope tsubasaa2830505-7621s-projects \
  --confirm