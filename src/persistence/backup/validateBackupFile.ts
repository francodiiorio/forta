import { BACKUP_FORMAT_VERSION, type BackupFile } from './types'

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupValidationError'
  }
}

function isEntityArray(value: unknown): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'object' && item !== null && 'id' in item)
  )
}

/**
 * Structural validation only: shape of the backup, and that every record
 * has an id. It deliberately does not re-validate individual domain
 * fields — that's what forms and domain code already do on the way in,
 * and duplicating it here would just give it a second, divergeable copy.
 */
export function validateBackupFile(input: unknown): BackupFile {
  if (typeof input !== 'object' || input === null) {
    throw new BackupValidationError('Backup file must be a JSON object.')
  }

  const { formatVersion, exportedAt, data } = input as Record<string, unknown>

  if (typeof formatVersion !== 'number') {
    throw new BackupValidationError('Backup file is missing a numeric "formatVersion".')
  }

  if (formatVersion > BACKUP_FORMAT_VERSION) {
    throw new BackupValidationError(
      `Backup format version ${formatVersion} is newer than this app supports (${BACKUP_FORMAT_VERSION}). Update the app before importing this file.`,
    )
  }

  if (typeof exportedAt !== 'string') {
    throw new BackupValidationError('Backup file is missing "exportedAt".')
  }

  if (typeof data !== 'object' || data === null) {
    throw new BackupValidationError('Backup file is missing "data".')
  }

  const { exercises, workouts, routines, bodyMeasurements, userProfile } = data as Record<string, unknown>

  if (
    !isEntityArray(exercises) ||
    !isEntityArray(workouts) ||
    !isEntityArray(routines) ||
    !isEntityArray(bodyMeasurements)
  ) {
    throw new BackupValidationError(
      'Backup "data" must contain exercises, workouts, routines, and bodyMeasurements arrays, each entry with an "id".',
    )
  }

  // userProfile was added after formatVersion 1 shipped (D-042); backups
  // exported before that simply don't have it, so a missing field means
  // "no profile data" rather than a validation error.
  if (userProfile !== undefined && !isEntityArray(userProfile)) {
    throw new BackupValidationError('Backup "data.userProfile", if present, must be an array with an "id" per entry.')
  }

  return {
    formatVersion,
    exportedAt,
    data: { exercises, workouts, routines, bodyMeasurements, userProfile: isEntityArray(userProfile) ? userProfile : [] },
  } as unknown as BackupFile
}
