import { useState } from 'react'
import { useWorkouts } from '../../hooks/useWorkouts'
import type { Id } from '../../types/common'
import { isoDateTimeToDateInput } from '../../utils/date'
import type { ExercisesApi } from '../exercises/useExercises'
import { WorkoutDetail } from './WorkoutDetail'

interface HistorySectionProps {
  exercisesApi: ExercisesApi
}

/**
 * Workout history: a list of past sessions and the detail of one at a
 * time. Loads its own workouts (remounted fresh each time this tab is
 * shown, so a workout saved elsewhere always shows up) rather than
 * sharing a lifted copy the way `exercisesApi` is — there's no draft to
 * preserve across tab switches here, so there's nothing lifting would
 * buy beyond risking staleness. See docs/DECISIONS.md D-029.
 */
export function HistorySection({ exercisesApi }: HistorySectionProps) {
  const { workouts, loading } = useWorkouts()
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
