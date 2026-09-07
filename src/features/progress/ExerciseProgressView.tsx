import { useState } from 'react'
import { getExerciseProgressSeries } from '../../analytics/progress/exerciseProgress'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import { isoDateTimeToDateInput } from '../../utils/date'

interface ExerciseProgressViewProps {
  exercises: Exercise[]
  workouts: Workout[]
}

const METRIC_LABELS: Record<string, string> = {
  ESTIMATED_1RM: '1RM estimado (kg)',
  MAX_REPS: 'Reps',
  MAX_DURATION: 'Duración (seg)',
}

/**
 * Performance over time for one exercise — a trend to read, not a
 * single computed verdict. Performance isn't confounded by frequency the
 * way volume is, so this is the safest place to actually show a rising
 * or falling line. See docs/ANALYTICS.md.
 */
export function ExerciseProgressView({ exercises, workouts }: ExerciseProgressViewProps) {
  const [exerciseId, setExerciseId] = useState('')
  const exercise = exercises.find((candidate) => candidate.id === exerciseId)
  const series = exercise ? getExerciseProgressSeries(exercise, workouts) : []

  return (
    <section aria-label="Progreso por ejercicio">
      <h3>Progreso por ejercicio</h3>

      <label>
        Ejercicio
        <select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
          <option value="">Elegir ejercicio…</option>
          {exercises.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
      </label>

      {exercise && exercise.trackingType === 'ASSISTED_BODYWEIGHT' && (
        <p>No se calcula progreso para ejercicios asistidos (ver D-025).</p>
      )}

      {exercise && series.length === 0 && exercise.trackingType !== 'ASSISTED_BODYWEIGHT' && (
        <p>Todavía no hay series completadas registradas para este ejercicio.</p>
      )}

      {series.length > 0 && (
        <ul>
          {series.map((point) => (
            <li key={point.workoutId}>
              {isoDateTimeToDateInput(point.date)}: {point.value} {METRIC_LABELS[point.metric]}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
