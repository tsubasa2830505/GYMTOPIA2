# Facilities Data Model

This app now uses a centralized, strongly-typed facilities schema aligned with the current UI condition set.

- Type: `GymFacilities` (TypeScript)
- Keys: fixed `FacilityKey` union matching the UI selector IDs
- Storage: `gyms.facilities` JSONB in Supabase

## TypeScript

Path: `src/types/facilities.ts`

- `FacilityKey`: union of supported facility flags (e.g. `"24hours"`, `"shower"`, `"parking"`, ...)
- `GymFacilities = Record<FacilityKey, boolean>`
- `FACILITY_META`: label/description and category metadata (no icon deps)
- `FACILITY_CATEGORIES_NO_ICON`: grouped meta for UI mapping
- `createEmptyFacilities()`: factory with all flags `false`

## Database (Supabase)

`gyms.facilities` should store a JSON object with the same keys as `FacilityKey` and boolean values. Example:

```json
{
  "24hours": true,
  "shower": true,
  "parking": false,
  "locker": true,
  "wifi": true,
  "chalk": false,
  "belt_rental": false,
  "personal_training": true,
  "group_lesson": false,
  "studio": true,
  "sauna": false,
  "pool": false,
  "jacuzzi": false,
  "massage_chair": false,
  "cafe": true,
  "women_only": false,
  "barrier_free": true,
  "kids_room": false,
  "english_support": true
}
```

Notes:
- Keep keys in snake/camel case exactly as in `FacilityKey` to avoid mapping.
- Add new facilities by extending `FacilityKey`, `FACILITY_META`, and `FACILITY_CATEGORIES_NO_ICON`.

## Frontend usage

- The home page `ConditionSelector` reads facility items from the shared meta to avoid drift.
- The `Gym` interface in `src/lib/supabase/gyms.ts` now types `facilities` as `GymFacilities`.

## Future filtering (optional)

When adding filtering against Supabase:

- For “true” flags: `... .contains('facilities', { sauna: true, shower: true })`
- Or JSONB path: `... .filter('facilities->>sauna', 'eq', 'true')`

