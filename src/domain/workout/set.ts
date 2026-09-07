import type { Id } from '../../types/common'

/** See docs/FITNESS_DOMAIN.md#set. */
export const SET_TYPES = ['WORKING', 'WARMUP', 'DROPSET', 'FAILURE'] as const
export type SetType = (typeof SET_TYPES)[number]

/** One performed (or planned) unit of an exercise. */
export interface Set {
  id: Id
  weight?: number
  reps?: number
  /** Present for TIME-tracked exercises (e.g. a plank hold) instead of reps. */
  durationSeconds?: number
  rir?: number
  rpe?: number
  type: SetType
  completed: boolean
}

/**
 * Working sets (including dropsets and failure sets) count toward volume,
 * PRs, and progress. Warm-up sets never do. See docs/FITNESS_DOMAIN.md.
 */
export function isWorkingSet(type: SetType): boolean {
  return type !== 'WARMUP'
}
