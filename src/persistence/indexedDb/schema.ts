export const DATABASE_NAME = 'forta'

/**
 * IndexedDB's own database version *is* the schema version — there is no
 * separate schemaVersion field to keep in sync. See docs/DECISIONS.md.
 */
export const DATABASE_VERSION = 2

export const STORE_NAMES = {
  exercises: 'exercises',
  workouts: 'workouts',
  routines: 'routines',
  bodyMeasurements: 'bodyMeasurements',
  userProfile: 'userProfile',
} as const

export type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES]
