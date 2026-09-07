import { useState } from 'react'
import { ChevronRightIcon } from '../../components/icons'
import { Modal } from '../../components/Modal'
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
 * time, shown in a modal (D-045) rather than inline below a potentially
 * long list — inline made "Ver detalle" look broken, since opening it
 * added content far below the click with no visual feedback near it.
 * Loads its own workouts (remounted fresh each time this tab is shown,
 * so a workout saved elsewhere always shows up) rather than sharing a
 * lifted copy the way `exercisesApi` is — there's no draft to preserve
 * across tab switches here, so there's nothing lifting would buy beyond
 * risking staleness. See docs/DECISIONS.md D-029.
 */
export function HistorySection({ exercisesApi }: HistorySectionProps) {
  const { workouts, loading } = useWorkouts()
  const [selectedId, setSelectedId] = useState<Id | null>(null)

  const exerciseById = new Map(exercisesApi.exercises.map((exercise) => [exercise.id, exercise]))
  const selected = workouts.find((workout) => workout.id === selectedId) ?? null

  return (
    <section className="card" aria-label="Historial">
      <h2>Historial</h2>

      {loading && <p className="muted">Cargando historial…</p>}

      {!loading && workouts.length === 0 && <p className="muted">No hay entrenamientos todavía.</p>}

      {!loading && workouts.length > 0 && (
        <ul className="history-list">
          {workouts.map((workout) => {
            const totalSets = workout.exercises.reduce((sum, we) => sum + we.sets.length, 0)
            return (
              <li key={workout.id}>
                <button
                  type="button"
                  className="history-item"
                  aria-label="Ver detalle"
                  onClick={() => setSelectedId(workout.id)}
                >
                  <div className="history-item-main">
                    <div className="history-item-header">
                      <span className="history-item-date">{isoDateTimeToDateInput(workout.startedAt)}</span>
                      <span className="history-item-badge">{totalSets} series</span>
                    </div>
                    <span className="history-item-exercises">
                      {workout.exercises
                        .map((workoutExercise) => exerciseById.get(workoutExercise.exerciseId)?.name ?? '?')
                        .join(', ')}
                    </span>
                  </div>
                  <ChevronRightIcon className="history-item-chevron" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={selected ? isoDateTimeToDateInput(selected.startedAt) : 'Detalle del entrenamiento'}
      >
        {selected && <WorkoutDetail workout={selected} exercisesApi={exercisesApi} />}
      </Modal>
    </section>
  )
}
