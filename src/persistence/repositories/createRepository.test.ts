import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { closeDatabase } from '../indexedDb/openDatabase'
import { DATABASE_NAME, STORE_NAMES } from '../indexedDb/schema'
import { createRepository } from './createRepository'

interface Fixture {
  id: string
  label: string
}

afterEach(async () => {
  await closeDatabase()
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
  })
})

describe('createRepository', () => {
  it('adds, reads, updates, lists, and removes an entity', async () => {
    const repo = createRepository<Fixture>(STORE_NAMES.exercises)

    await repo.add({ id: '1', label: 'a' })
    expect(await repo.getById('1')).toEqual({ id: '1', label: 'a' })

    await repo.update({ id: '1', label: 'b' })
    expect(await repo.getById('1')).toEqual({ id: '1', label: 'b' })
    expect(await repo.getAll()).toEqual([{ id: '1', label: 'b' }])

    await repo.remove('1')
    expect(await repo.getById('1')).toBeUndefined()
    expect(await repo.getAll()).toEqual([])
  })

  it('returns undefined for an id that was never stored', async () => {
    const repo = createRepository<Fixture>(STORE_NAMES.exercises)

    expect(await repo.getById('missing')).toBeUndefined()
  })
})
