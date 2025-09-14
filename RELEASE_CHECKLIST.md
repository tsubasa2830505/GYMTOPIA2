# Release Checklist (GYMTOPIA 2.0)

## 1) Supabase (staging → production)

- [ ] Apply SQLs in order (staging first):
  - `supabase/09-align-schema-with-app.sql`
  - `supabase/10-social-core.sql`
  - `supabase/11-seed-minimal-machines.sql` (optional)
  - `supabase/12-normalize-gyms-location.sql` (optional)
  - `supabase/13-rls-readonly.sql`
- [ ] Verify endpoints (anon):
  - `/rest/v1/gyms?select=id,name,prefecture,city&limit=5`
  - `/rest/v1/machines?select=id,name,target_category&limit=5`
  - `/rest/v1/gym_machines?select=*,machine:machines(*)&limit=5`
  - `/rest/v1/gym_posts?select=id,is_public,created_at&limit=1`
- [ ] RLS policies: ensure expected access
  - Public read: gyms/machines/machine_makers/gym_machines/muscle_groups
  - Public posts: `is_public=true` readable; others require owner
  - Self-only mutate: posts/likes/comments/follows/gym_friends/favorite_gyms/notifications

## 2) Next.js app (Vercel)

- [ ] Vercel project linked at repo root (uses `vercel.json` at root)
- [ ] Set Vercel Environment Variables (Production):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (Optional) `SENTRY_DSN`, etc.
- [ ] Build check locally:
  - `cd gymtopia-app && npm ci && npm run build`
- [ ] Trigger deploy:
  - `./deploy.sh` (or push to main if Git integration)

## 3) Post-deploy validation

- [ ] Search: `/search/results?prefecture=東京都` returns gym cards
- [ ] Gym machines join works in detail page (after wiring UI to DB)
- [ ] Post feed loads (public posts)
- [ ] Auth flows (signup/login) work against `public.users`

## 4) Optional hardening

- [ ] Rotate anon key and re-deploy if needed
- [ ] Restrict INSERT/UPDATE on read-only tables to service role functions
- [ ] Add error monitoring (Sentry/Logflare)

