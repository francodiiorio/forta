import { getLastNWeekRanges } from '../../analytics/dateRange'
import { getGeneralProgressOverview } from '../../analytics/progress/generalProgress'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import type { Id } from '../../types/common'

const WEEKS_SHOWN = 8

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10)
}

interface GeneralProgressViewProps {
  workouts: Workout[]
  exerciseById: Map<Id, Exercise>
}

/**
 * Session count and total volume, side by side, one row per week.
 * Deliberately not a single "+X% progress" figure — see
 * docs/DECISIONS.md D-004: two weeks can have the same volume for very
 * different reasons (more sessions vs. harder sessions), and this view
 * exists so that difference stays visible instead of getting averaged away.
 */
export function GeneralProgressView({ workouts, exerciseById }: GeneralProgressViewProps) {
  const ranges = getLastNWeekRanges(todayDateOnly(), WEEKS_SHOWN)
  const overview = getGeneralProgressOverview(workouts, exerciseById, ranges)

  return (
    <section aria-label="Progreso general">
      <h3>Progreso general (últimas {WEEKS_SHOWN} semanas)</h3>
      <table>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Sesiones</th>
            <th>Volumen total (kg)</th>
          </tr>
        </thead>
        <tbody>
          {overview.map((point) => (
            <tr key={point.range.start}>
              <td>
                {point.range.start} – {point.range.end}
              </td>
              <td>{point.sessionCount}</td>
              <td>{point.totalVolume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
