import type { Exercise } from '../../domain/exercise/exercise'
import type { Routine } from '../../domain/routine/routine'
import type { ExercisesApi } from '../exercises/useExercises'
import { RoutineForm } from './RoutineForm'
import { RoutineList } from './RoutineList'
import { useRoutines } from './useRoutines'

interface RoutinesSectionProps {
  exercisesApi: ExercisesApi
  onStartRoutine: (routine: Routine, catalog: Exercise[]) => void
}

/** Create and reuse routines. Starting a workout from one is handled by the caller (App). */
export function RoutinesSection({ exercisesApi, onStartRoutine }: RoutinesSectionProps) {
  const { routines, createRoutine } = useRoutines()

  return (
    <section className="card" aria-label="Rutinas">
      <h2>Rutinas</h2>
      <RoutineList routines={routines} exercisesApi={exercisesApi} onStart={onStartRoutine} />
      <RoutineForm exercisesApi={exercisesApi} onCreate={createRoutine} />
    </section>
  )
}
