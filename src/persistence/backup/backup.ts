import { openDatabase } from '../indexedDb/openDatabase'
import { promisifyRequest, promisifyTransaction } from '../indexedDb/promisify'
import { STORE_NAMES } from '../indexedDb/schema'
import { BACKUP_FORMAT_VERSION, type BackupData, type BackupFile } from './types'
import { validateBackupFile } from './validateBackupFile'

/** Reads every persisted entity into one portable, versioned snapshot. */
export async function exportBackup(): Promise<BackupFile> {
  const db = await openDatabase()
  const storeNames = Object.values(STORE_NAMES)
  const tx = db.transaction(storeNames, 'readonly')

  const data: BackupData = {
    exercises: await promisifyRequest(tx.objectStore(STORE_NAMES.exercises).getAll()),
    workouts: await promisifyRequest(tx.objectStore(STORE_NAMES.workouts).getAll()),
    routines: await promisifyRequest(tx.objectStore(STORE_NAMES.routines).getAll()),
    bodyMeasurements: await promisifyRequest(tx.objectStore(STORE_NAMES.bodyMeasurements).getAll()),
  }

  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

/**
 * Restores from a backup snapshot. This *replaces* all locally stored
 * data — it is a restore, not a merge — in one atomic transaction across
 * every store, so a failure partway through cannot leave some entity
 * types cleared and others not. See docs/DECISIONS.md.
 */
export async function importBackup(input: unknown): Promise<void> {
  const backup = validateBackupFile(input)

  const db = await openDatabase()
  const storeNames = Object.values(STORE_NAMES)
  const tx = db.transaction(storeNames, 'readwrite')

  const entriesByStore: [string, { id: string }[]][] = [
    [STORE_NAMES.exercises, backup.data.exercises],
    [STORE_NAMES.workouts, backup.data.workouts],
    [STORE_NAMES.routines, backup.data.routines],
    [STORE_NAMES.bodyMeasurements, backup.data.bodyMeasurements],
  ]

  for (const [storeName, entities] of entriesByStore) {
    const store = tx.objectStore(storeName)
    store.clear()
    for (const entity of entities) {
      store.put(entity)
    }
  }

  await promisifyTransaction(tx)
}
