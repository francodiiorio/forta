import type { Exercise } from '../exercise/exercise'
import { isWorkingSet, type Set } from '../workout/set'
import type { Muscle } from './muscle'

/**
 * Direct sets (primary muscles) and indirect involvement (secondary
 * muscles), kept separate. No fractional weighting is assigned to
 * indirect involvement — see docs/FITNESS_DOMAIN.md and D-003.
 */
export interface MuscleInvolvement {
  direct: Muscle[]
  indirect: Muscle[]
}

/**
 * Classifies which muscles one set trains. Returns null for warm-up sets,
 * which count toward neither direct nor indirect involvement.
 */
export function classifySetInvolvement(exercise: Exercise, set: Set): MuscleInvolvement | null {
  if (!isWorkingSet(set.type)) {
    return null
  }

  return {
    direct: exercise.primaryMuscles,
    indirect: exercise.secondaryMuscles,
  }
}
