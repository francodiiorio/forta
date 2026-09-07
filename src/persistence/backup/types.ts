import type { BodyMeasurement } from '../../domain/body/bodyMeasurement'
import type { Exercise } from '../../domain/exercise/exercise'
import type { UserProfile } from '../../domain/profile/userProfile'
import type { Routine } from '../../domain/routine/routine'
import type { Workout } from '../../domain/workout/workout'
import type { ISODateTimeString } from '../../types/common'

/**
 * Independent from the IndexedDB schema version (docs/DECISIONS.md D-002):
 * a schema migration doesn't necessarily change this, and vice versa.
 */
export const BACKUP_FORMAT_VERSION = 1

export interface BackupData {
  exercises: Exercise[]
  workouts: Workout[]
  routines: Routine[]
  bodyMeasurements: BodyMeasurement[]
  /** 0 or 1 entries — see docs/DECISIONS.md D-042 for why this is an array like every other entity list rather than a special-cased singleton field. */
  userProfile: UserProfile[]
}

export interface BackupFile {
  formatVersion: number
  exportedAt: ISODateTimeString
  data: BackupData
}
