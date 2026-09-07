import { STORE_NAMES } from '../indexedDb/schema'

type Migration = (db: IDBDatabase) => void

/**
 * One entry per schema version, keyed by the version it upgrades *to*.
 * Each migration only does what's needed to go from the previous version
 * to this one — it must not be rewritten when a later version is added.
 */
const MIGRATIONS: Record<number, Migration> = {
  1: (db) => {
    db.createObjectStore(STORE_NAMES.exercises, { keyPath: 'id' })
    db.createObjectStore(STORE_NAMES.workouts, { keyPath: 'id' })
    db.createObjectStore(STORE_NAMES.routines, { keyPath: 'id' })
    db.createObjectStore(STORE_NAMES.bodyMeasurements, { keyPath: 'id' })
  },
  2: (db) => {
    db.createObjectStore(STORE_NAMES.userProfile, { keyPath: 'id' })
  },
}

/**
 * Applies every migration between `fromVersion` (exclusive) and
 * `db.version` (inclusive). Called from inside `onupgradeneeded`, so it
 * runs within IndexedDB's versionchange transaction.
 */
export function runMigrations(db: IDBDatabase, fromVersion: number): void {
  for (let version = fromVersion + 1; version <= db.version; version++) {
    const migration = MIGRATIONS[version]

    if (!migration) {
      throw new Error(`Missing migration for schema version ${version}.`)
    }

    migration(db)
  }
}
