import type { Exercise } from '../../domain/exercise/exercise'
import type { Muscle } from '../../domain/muscle/muscle'
import type { Workout } from '../../domain/workout/workout'
import type { Id } from '../../types/common'
import { iterateSetInvolvements } from '../involvement'

/** Direct sets and indirect involvement, kept separate — never merged or weighted. See D-003. */
export interface MuscleWorkload {
  directSets: number
  indirectSets: number
}

export function calculateMuscleWorkload(
  workouts: Workout[],
  exerciseById: Map<Id, Exercise>,
): Map<Muscle, MuscleWorkload> {
  const result = new Map<Muscle, MuscleWorkload>()

  function bump(muscle: Muscle, field: keyof MuscleWorkload) {
    const current = result.get(muscle) ?? { directSets: 0, indirectSets: 0 }
    current[field] += 1
    result.set(muscle, current)
  }

  for (const { involvement } of iterateSetInvolvements(workouts, exerciseById)) {
    involvement.direct.forEach((muscle) => bump(muscle, 'directSets'))
    involvement.indirect.forEach((muscle) => bump(muscle, 'indirectSets'))
  }

  return result
}
