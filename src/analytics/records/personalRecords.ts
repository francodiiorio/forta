import type { Exercise } from '../../domain/exercise/exercise'
import { isWorkingSet } from '../../domain/workout/set'
import type { Workout } from '../../domain/workout/workout'
import type { Id, ISODateTimeString } from '../../types/common'
import { estimateOneRepMax } from './estimatedOneRepMax'

export interface PersonalRecord {
  value: number
  achievedAt: ISODateTimeString
  workoutId: Id
}

/**
 * PRs, one metric per tracking type — see docs/DECISIONS.md D-025:
 * - `WEIGHT_REPS`: heaviest completed working-set weight, and separately
 *   the best estimated 1RM (a heavier single and a better-estimated 1RM
 *   aren't always the same set).
 * - `BODYWEIGHT_REPS` / `REPS_ONLY`: most reps in a completed working set.
 * - `TIME`: longest completed working-set duration.
 * - `ASSISTED_BODYWEIGHT`: not computed. "Best" would mean *least*
 *   assistance, which isn't comparable via a simple max() the way the
 *   others are, and there's no bodyweight data to normalize against.
 */
export interface PersonalRecords {
  maxWeight?: PersonalRecord
  estimatedOneRepMax?: PersonalRecord
  maxReps?: PersonalRecord
  maxDuration?: PersonalRecord
}

export function calculatePersonalRecords(exercise: Exercise, workouts: Workout[]): PersonalRecords {
  const records: PersonalRecords = {}

  function consider(field: keyof PersonalRecords, value: number | null | undefined, workout: Workout) {
    if (value === null || value === undefined) return
    const current = records[field]
    if (!current || value > current.value) {
      records[field] = { value, achievedAt: workout.startedAt, workoutId: workout.id }
    }
  }

  for (const workout of workouts) {
    for (const workoutExercise of workout.exercises) {
      if (workoutExercise.exerciseId !== exercise.id) continue

      for (const set of workoutExercise.sets) {
        if (!isWorkingSet(set.type) || !set.completed) continue

        if (exercise.trackingType === 'WEIGHT_REPS') {
          consider('maxWeight', set.weight, workout)
          consider('estimatedOneRepMax', estimateOneRepMax(exercise, set), workout)
        } else if (exercise.trackingType === 'BODYWEIGHT_REPS' || exercise.trackingType === 'REPS_ONLY') {
          consider('maxReps', set.reps, workout)
        } else if (exercise.trackingType === 'TIME') {
          consider('maxDuration', set.durationSeconds, workout)
        }
      }
    }
  }

  return records
}
