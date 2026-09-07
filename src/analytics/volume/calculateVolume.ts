import type { Exercise } from '../../domain/exercise/exercise'
import { isWorkingSet, type Set as WorkoutSet } from '../../domain/workout/set'
import type { Workout } from '../../domain/workout/workout'
import type { Id } from '../../types/common'

/**
 * Volume (weight × reps) is defined only for `WEIGHT_REPS` sets.
 * `BODYWEIGHT_REPS`/`REPS_ONLY`/`TIME` have no weight to multiply, and
 * `ASSISTED_BODYWEIGHT`'s recorded weight is assistance — less
 * assistance is *harder*, so multiplying it directly would invert what
 * "more volume" is supposed to mean. See docs/ANALYTICS.md and D-023.
 */
export function calculateSetVolume(exercise: Exercise, set: WorkoutSet): number {
  if (exercise.trackingType !== 'WEIGHT_REPS') return 0
  if (!isWorkingSet(set.type)) return 0
  if (set.weight === undefined || set.reps === undefined) return 0

  return set.weight * set.reps
}

export function calculateTotalVolume(workouts: Workout[], exerciseById: Map<Id, Exercise>): number {
  let total = 0

  for (const workout of workouts) {
    for (const workoutExercise of workout.exercises) {
      const exercise = exerciseById.get(workoutExercise.exerciseId)
      if (!exercise) continue

      for (const set of workoutExercise.sets) {
        total += calculateSetVolume(exercise, set)
      }
    }
  }

  return total
}

export function calculateVolumeByExercise(workouts: Workout[], exerciseById: Map<Id, Exercise>): Map<Id, number> {
  const result = new Map<Id, number>()

  for (const workout of workouts) {
    for (const workoutExercise of workout.exercises) {
      const exercise = exerciseById.get(workoutExercise.exerciseId)
      if (!exercise) continue

      const volume = workoutExercise.sets.reduce((sum, set) => sum + calculateSetVolume(exercise, set), 0)
      result.set(exercise.id, (result.get(exercise.id) ?? 0) + volume)
    }
  }

  return result
}
