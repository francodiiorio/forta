import { afterEach, describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import { closeDatabase } from '../indexedDb/openDatabase'
import { DATABASE_NAME, STORE_NAMES } from '../indexedDb/schema'
import { createRepository } from '../repositories/createRepository'
import { exportBackup, importBackup } from './backup'
import { BackupValidationError } from './validateBackupFile'

const benchPress: Exercise = {
  id: 'ex-1',
  name: 'Bench Press',
  primaryMuscles: ['CHEST'],
  secondaryMuscles: ['TRICEPS', 'ANTERIOR_DELTOID'],
  equipment: 'BARBELL',
  trackingType: 'WEIGHT_REPS',
  laterality: 'BILATERAL',
  category: 'COMPOUND',
}

afterEach(async () => {
  await closeDatabase()
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
  })
})

describe('exportBackup / importBackup', () => {
  it('round-trips all stored data', async () => {
    const exercises = createRepository<Exercise>(STORE_NAMES.exercises)
    await exercises.add(benchPress)

    const backup = await exportBackup()
    expect(backup.formatVersion).toBe(1)
    expect(backup.data.exercises).toEqual([benchPress])

    await exercises.remove(benchPress.id)
    expect(await exercises.getAll()).toEqual([])

    await importBackup(backup)
    expect(await exercises.getAll()).toEqual([benchPress])
  })

  it('replaces existing data on import rather than merging', async () => {
    const exercises = createRepository<Exercise>(STORE_NAMES.exercises)
    await exercises.add({ ...benchPress, id: 'stale', name: 'Stale Exercise' })

    await importBackup({
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      data: { exercises: [benchPress], workouts: [], routines: [], bodyMeasurements: [] },
    })

    expect(await exercises.getAll()).toEqual([benchPress])
  })

  it('rejects malformed input and leaves stored data untouched', async () => {
    const exercises = createRepository<Exercise>(STORE_NAMES.exercises)
    await exercises.add(benchPress)

    await expect(importBackup({ not: 'a backup' })).rejects.toThrow(BackupValidationError)
    expect(await exercises.getAll()).toEqual([benchPress])
  })

  it('rejects a backup format newer than this app supports', async () => {
    await expect(
      importBackup({
        formatVersion: 999,
        exportedAt: new Date().toISOString(),
        data: { exercises: [], workouts: [], routines: [], bodyMeasurements: [] },
      }),
    ).rejects.toThrow(BackupValidationError)
  })
})
