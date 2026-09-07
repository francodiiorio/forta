import type { Id } from '../../types/common'
import { openDatabase } from '../indexedDb/openDatabase'
import { promisifyRequest } from '../indexedDb/promisify'
import type { StoreName } from '../indexedDb/schema'

export interface Repository<T> {
  add(entity: T): Promise<void>
  getById(id: Id): Promise<T | undefined>
  getAll(): Promise<T[]>
  update(entity: T): Promise<void>
  remove(id: Id): Promise<void>
}

/**
 * Generic CRUD repository over one object store. Entity-specific
 * repositories (see ../repositories/*Repository.ts) are thin wrappers
 * around this — Stage 2 doesn't need query methods beyond CRUD yet.
 */
export function createRepository<T extends { id: Id }>(storeName: StoreName): Repository<T> {
  async function withStore<R>(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<R>,
  ): Promise<R> {
    const db = await openDatabase()
    const store = db.transaction(storeName, mode).objectStore(storeName)
    return promisifyRequest(run(store))
  }

  return {
    async add(entity) {
      await withStore('readwrite', (store) => store.add(entity))
    },
    getById(id) {
      return withStore('readonly', (store) => store.get(id))
    },
    getAll() {
      return withStore('readonly', (store) => store.getAll())
    },
    async update(entity) {
      await withStore('readwrite', (store) => store.put(entity))
    },
    async remove(id) {
      await withStore('readwrite', (store) => store.delete(id))
    },
  }
}
