# Schema Transition Plan (Long-term Safe Migration)

This document describes how we move from legacy/overlapping tables to a normalized, maintainable schema while keeping the app working during the transition.

## Goals
- Preserve read-paths via compatibility views where feasible
- Write only to canonical, normalized tables
- Provide idempotent, reversible migration steps
- Keep RLS and future indexing in mind

## Canonical Tables (Target)
- Users: `public.users` (+ `public.user_profiles`)
- Gyms: `public.gyms`
- Equipment: `public.equipment`, `public.equipment_categories`, `public.gym_equipment`
- Social Feed: `public.posts`, `public.likes`, `public.comments`
- Reviews: `public.gym_reviews`, `public.favorite_gyms`
- Workouts (min set): `public.workout_sessions`, `public.workout_exercises`, `public.exercise_sets`, `public.personal_records`, `public.body_measurements`, `public.fitness_goals`

## Compatibility Views (Read only)
- `public.machines` (views equipment)
- `public.machine_makers` (distinct makers)
- `public.gym_machines` (views `gym_equipment`)
- `public.profiles` (projects `users`) NOTE: only create this View if no physical `profiles` table exists.

## Deprecations (Do not write)
- `gym_machines`, `gym_free_weights`, `gym_facilities`
- `gym_posts` (use `posts`)
- `profiles` (migrate to `users` + `user_profiles`)
- `muscle_parts` (use `muscle_groups`)

## Rollout Steps
1) Apply compatibility views
   - Run `supabase/compat-views.sql` in SQL Editor.
   - If a physical `public.profiles` exists, skip creating the `profiles` view for now.

2) Seed/ensure master data
   - Run `supabase/03-add-equipment-data.sql` to populate `equipment`.

3) Cut writes to legacy tables
   - App now writes equipment to `gym_equipment` only.
   - App uses `posts` instead of `gym_posts`.

4) Confirm reads
   - Gym detail loads machines/free weights via `gym_equipment` join.
   - Feed reads from `posts` (fallback samples if empty).

5) Plan profiles consolidation (manual/controlled)
   - If `public.profiles` exists with data, plan a one-time copy to `users`/`user_profiles` and then replace with a view named `public.profiles`.
   - Provide a guarded migration script; do not DROP automatically in production.

## RLS & Indexing (Production hardening)
- Ensure policies exist for `posts`, `likes`, `comments`, `gyms`, `gym_equipment` (see `supabase/schema-complete.sql`).
- Indexes: keep `idx_gym_equipment_gym_id`, `idx_posts_created`, and equipment lookups by `name` if name-based queries are used.

## Backfill/Consistency Checks
- `gym_equipment` vs `gyms.equipment_types`: keep `gyms.equipment_types` as UI hint only; prefer computing from `gym_equipment` in the future.
- Free weight names that cannot be matched to `equipment(type='free_weight')` are logged and skipped by the app path; provide an admin backfill where needed.

## Rollback
- Because writes are only directed to canonical tables and compatibility views are additive, removing the views restores previous behavior after code revert.

