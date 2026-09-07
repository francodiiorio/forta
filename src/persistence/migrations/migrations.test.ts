import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { STORE_NAMES } from '../indexedDb/schema'
import { runMigrations } from './migrations'

describe('runMigrations', () => {
  it('creates every v1 object store from a fresh database', async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('migrations-test-fresh', 1)
      request.onupgradeneeded = (event) => runMigrations(request.result, event.oldVersion)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    expect(Array.from(db.objectStoreNames).sort()).toEqual(Object.values(STORE_NAMES).sort())

    db.close()
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('migrations-test-fresh')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  })

  it('throws instead of silently skipping a version with no defined migration', () => {
    // A pure-function check: no real IndexedDB connection involved, so
    // there's nothing to clean up and no half-aborted transaction to hang
    // on (throwing inside a real onupgradeneeded leaves the connection in
    // an abort sequence that a plain afterEach can't reliably wait out).
    const fakeCreatedStores: string[] = []
    const fakeDb = {
      version: 3,
      createObjectStore: (name: string) => {
        fakeCreatedStores.push(name)
      },
    } as unknown as IDBDatabase

    expect(() => runMigrations(fakeDb, 0)).toThrow(/schema version 2/)
    expect(fakeCreatedStores.sort()).toEqual(Object.values(STORE_NAMES).sort())
  })
})
