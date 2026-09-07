import type { Exercise } from '../../domain/exercise/exercise'
import type { Routine } from '../../domain/routine/routine'
import type { ExercisesApi } from '../exercises/useExercises'

interface RoutineListProps {
  routines: Routine[]
  exercisesApi: ExercisesApi
  onStart: (routine: Routine, catalog: Exercise[]) => void
}

/** Lists saved routines and lets the user start a workout from one. */
export function RoutineList({ routines, exercisesApi, onStart }: RoutineListProps) {
  const exerciseById = new Map(exercisesApi.exercises.map((exercise) => [exercise.id, exercise]))

  if (routines.length === 0) {
    return <p>No hay rutinas todavía.</p>
  }

  return (
    <ul>
      {routines.map((routine) => (
        <li key={routine.id}>
          <strong>{routine.name}</strong>
          <span>
            {' '}
            (
            {routine.exercises
              .map((routineExercise) => exerciseById.get(routineExercise.exerciseId)?.name ?? '?')
              .join(', ')}
            )
          </span>
          <button type="button" onClick={() => onStart(routine, exercisesApi.exercises)}>
            Usar esta rutina
          </button>
        </li>
      ))}
    </ul>
  )
}
