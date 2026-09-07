import { useWorkouts } from '../../hooks/useWorkouts'
import type { ExercisesApi } from '../exercises/useExercises'
import { ExerciseProgressView } from './ExerciseProgressView'
import { GeneralProgressView } from './GeneralProgressView'
import { MuscleProgressView } from './MuscleProgressView'

interface ProgressSectionProps {
  exercisesApi: ExercisesApi
}

/**
 * Progress dashboard: general, per-exercise, per-muscle — each shown as
 * its own trend, never merged into a single derived score. See
 * docs/ANALYTICS.md and docs/DECISIONS.md D-004.
 *
 * Loads its own workouts (see HistorySection for why this isn't lifted
 * like `exercisesApi` is) so a workout saved elsewhere shows up here as
 * soon as this tab is opened.
 */
export function ProgressSection({ exercisesApi }: ProgressSectionProps) {
  const { workouts, loading } = useWorkouts()
  const exerciseById = new Map(exercisesApi.exercises.map((exercise) => [exercise.id, exercise]))

  if (loading || exercisesApi.loading) {
    return (
      <section aria-label="Progreso">
        <h2>Progreso</h2>
        <p>Cargando…</p>
      </section>
    )
  }

  if (workouts.length === 0) {
    return (
      <section aria-label="Progreso">
        <h2>Progreso</h2>
        <p>Todavía no hay entrenamientos registrados.</p>
      </section>
    )
  }

  return (
    <section aria-label="Progreso">
      <h2>Progreso</h2>
      <GeneralProgressView workouts={workouts} exerciseById={exerciseById} />
      <ExerciseProgressView exercises={exercisesApi.exercises} workouts={workouts} />
      <MuscleProgressView workouts={workouts} exerciseById={exerciseById} />
    </section>
  )
}
