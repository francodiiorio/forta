import { useState } from 'react'
import type { ExercisesApi } from '../exercises/useExercises'
import type { Id } from '../../types/common'
import { isoDateTimeToDateInput } from '../../utils/date'
import { useWorkoutHistory } from './useWorkoutHistory'
import { WorkoutDetail } from './WorkoutDetail'

interface HistorySectionProps {
  exercisesApi: ExercisesApi
}

/** Workout history: a list of past sessions and the detail of one at a time. */
export function HistorySection({ exercisesApi }: HistorySectionProps) {
  const { workouts, loading } = useWorkoutHistory()
  const [selectedId, setSelectedId] = useState<Id | null>(null)

  const exerciseById = new Map(exercisesApi.exercises.map((exercise) => [exercise.id, exercise]))
  const selected = workouts.find((workout) => workout.id === selectedId) ?? null

  return (
    <section aria-label="Historial">
      <h2>Historial</h2>

      {loading && <p>Cargando historial…</p>}

      {!loading && workouts.length === 0 && <p>No hay entrenamientos todavía.</p>}

      {!loading && workouts.length > 0 && (
        <ul>
          {workouts.map((workout) => (
            <li key={workout.id}>
              {isoDateTimeToDateInput(workout.startedAt)} —{' '}
              {workout.exercises
                .map((workoutExercise) => exerciseById.get(workoutExercise.exerciseId)?.name ?? '?')
                .join(', ')}
              <button type="button" onClick={() => setSelectedId(workout.id)}>
                Ver detalle
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <WorkoutDetail workout={selected} exercisesApi={exercisesApi} onClose={() => setSelectedId(null)} />
      )}
    </section>
  )
}
