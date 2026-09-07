import type { Id, ISODateTimeString } from '../../types/common'
import type { Set } from './set'

/** One exercise as performed within a workout, carrying its sets. */
export interface WorkoutExercise {
  id: Id
  exerciseId: Id
  sets: Set[]
}

/** A completed, historical training session. Not a live/active session. */
export interface Workout {
  id: Id
  routineId?: Id
  startedAt: ISODateTimeString
  completedAt: ISODateTimeString
  exercises: WorkoutExercise[]
  notes?: string
}
