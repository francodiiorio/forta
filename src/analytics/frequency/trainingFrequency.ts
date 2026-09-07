import type { Exercise } from '../../domain/exercise/exercise'
import type { Muscle } from '../../domain/muscle/muscle'
import type { Workout } from '../../domain/workout/workout'
import type { Id } from '../../types/common'
import { iterateSetInvolvements } from '../involvement'

/** Number of workout sessions — a session counts once regardless of how many sets it has. */
export function calculateTrainingFrequency(workouts: Workout[]): number {
  return workouts.length
}

export interface MuscleFrequency {
  /** Sessions with at least one direct set for this muscle. */
  directSessions: number
  /** Sessions with indirect involvement for this muscle but no direct set. */
  indirectOnlySessions: number
}

/**
 * How often each muscle was trained, counted per session (not per set) —
 * a muscle hit with 5 direct sets in one session still counts as one
 * `directSessions`. Direct and indirect-only are kept separate, same as
 * `calculateMuscleWorkload`.
 */
export function calculateMuscleFrequency(
  workouts: Workout[],
  exerciseById: Map<Id, Exercise>,
): Map<Muscle, MuscleFrequency> {
  const involvedByWorkout = new Map<Id, { direct: Set<Muscle>; indirect: Set<Muscle> }>()

  for (const { workout, involvement } of iterateSetInvolvements(workouts, exerciseById)) {
    const entry = involvedByWorkout.get(workout.id) ?? { direct: new Set<Muscle>(), indirect: new Set<Muscle>() }
    involvement.direct.forEach((muscle) => entry.direct.add(muscle))
    involvement.indirect.forEach((muscle) => entry.indirect.add(muscle))
    involvedByWorkout.set(workout.id, entry)
  }

  const result = new Map<Muscle, MuscleFrequency>()

  for (const { direct, indirect } of involvedByWorkout.values()) {
    for (const muscle of direct) {
      const current = result.get(muscle) ?? { directSessions: 0, indirectOnlySessions: 0 }
      current.directSessions += 1
      result.set(muscle, current)
    }

    for (const muscle of indirect) {
      if (direct.has(muscle)) continue

      const current = result.get(muscle) ?? { directSessions: 0, indirectOnlySessions: 0 }
      current.indirectOnlySessions += 1
      result.set(muscle, current)
    }
  }

  return result
}
