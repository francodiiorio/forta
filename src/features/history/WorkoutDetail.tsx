import type { Workout } from '../../domain/workout/workout'
import type { ExercisesApi } from '../exercises/useExercises'

interface WorkoutDetailProps {
  workout: Workout
  exercisesApi: ExercisesApi
}

/**
 * Read-only view of one past session: exercises and sets as recorded.
 * No volume, PR, or progress here — those are derived analytics
 * (Stage 6), computed on demand, never shown as if they were facts.
 * Rendered inside the Modal in HistorySection, which already shows the
 * workout's date as its title and provides the close control (D-045).
 */
export function WorkoutDetail({ workout, exercisesApi }: WorkoutDetailProps) {
  const exerciseById = new Map(exercisesApi.exercises.map((exercise) => [exercise.id, exercise]))

  return (
    <section aria-label="Detalle del entrenamiento">
      {workout.notes && <p className="muted">{workout.notes}</p>}

      {workout.exercises.map((workoutExercise) => {
        const exercise = exerciseById.get(workoutExercise.exerciseId)
        return (
          <div key={workoutExercise.id} className="detail-block">
            <h4>{exercise?.name ?? 'Ejercicio eliminado del catálogo'}</h4>
            <ul>
              {workoutExercise.sets.map((set, index) => (
                <li key={set.id}>
                  Serie {index + 1}:{' '}
                  {[
                    set.weight !== undefined ? `${set.weight} kg` : null,
                    set.reps !== undefined ? `${set.reps} reps` : null,
                    set.durationSeconds !== undefined ? `${set.durationSeconds} s` : null,
                  ]
                    .filter(Boolean)
                    .join(' × ') || '—'}{' '}
                  ({set.type.toLowerCase()}
                  {!set.completed ? ', incompleta' : ''})
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
