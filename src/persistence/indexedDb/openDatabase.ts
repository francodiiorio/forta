import { runMigrations } from '../migrations/migrations'
import { DATABASE_NAME, DATABASE_VERSION } from './schema'

let dbPromise: Promise<IDBDatabase> | null = null

/** Opens (or returns the cached) connection to the app database. */
export function openDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

      request.onupgradeneeded = (event) => {
        runMigrations(request.result, event.oldVersion)
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  return dbPromise
}

/** Closes the cached connection, if any. Used by tests to reset state. */
export async function closeDatabase(): Promise<void> {
  if (!dbPromise) {
    return
  }

  const db = await dbPromise
  db.close()
  dbPromise = null
}
