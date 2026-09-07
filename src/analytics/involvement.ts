import type { Exercise } from '../domain/exercise/exercise'
import { classifySetInvolvement, type MuscleInvolvement } from '../domain/muscle/muscleInvolvement'
import type { Workout } from '../domain/workout/workout'
import type { Id } from '../types/common'

export interface SetInvolvement {
  workout: Workout
  involvement: MuscleInvolvement
}

/**
 * Shared traversal for muscle-based analytics: every working set's
 * muscle involvement, paired with the workout it happened in. Used by
 * both `calculateMuscleWorkload` (counts sets) and
 * `calculateMuscleFrequency` (counts sessions) so the workout/exercise/
 * set iteration isn't duplicated between them.
 */
export function* iterateSetInvolvements(
  workouts: Workout[],
  exerciseById: Map<Id, Exercise>,
): Generator<SetInvolvement> {
  for (const workout of workouts) {
    for (const workoutExercise of workout.exercises) {
      const exercise = exerciseById.get(workoutExercise.exerciseId)
      if (!exercise) continue

      for (const set of workoutExercise.sets) {
        const involvement = classifySetInvolvement(exercise, set)
        if (involvement) yield { workout, involvement }
      }
    }
  }
}
