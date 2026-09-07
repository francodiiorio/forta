import type { Id } from '../../types/common'

/**
 * Exercise entry within a routine template — no performed values, just
 * which exercise it is. Extended in Stage 4 if routines need target
 * sets/reps; kept minimal until that's an actual product decision.
 */
export interface RoutineExercise {
  id: Id
  exerciseId: Id
}

/** A reusable template of exercises a workout can be started from. */
export interface Routine {
  id: Id
  name: string
  exercises: RoutineExercise[]
}
