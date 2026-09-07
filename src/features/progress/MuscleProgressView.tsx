import { useState } from 'react'
import { BarChart } from '../../components/BarChart'
import { getLastNWeekRanges } from '../../analytics/dateRange'
import { getMuscleProgressSeries } from '../../analytics/progress/muscleProgress'
import type { Exercise } from '../../domain/exercise/exercise'
import { MUSCLES, type Muscle } from '../../domain/muscle/muscle'
import type { Workout } from '../../domain/workout/workout'
import type { Id } from '../../types/common'

const WEEKS_SHOWN = 8

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10)
}

interface MuscleProgressViewProps {
  workouts: Workout[]
  exerciseById: Map<Id, Exercise>
}

/**
 * Direct sets, indirect involvement, and session count for one muscle,
 * one row per week — always shown together, never as a single number.
 * See docs/FITNESS_DOMAIN.md (direct vs. indirect) and D-004 (workload
 * needs frequency next to it to mean anything). Direct and indirect get
 * separate charts for the same reason they get separate columns.
 */
export function MuscleProgressView({ workouts, exerciseById }: MuscleProgressViewProps) {
  const [muscle, setMuscle] = useState<Muscle | ''>('')
  const ranges = getLastNWeekRanges(todayDateOnly(), WEEKS_SHOWN)
  const series = muscle ? getMuscleProgressSeries(muscle, workouts, exerciseById, ranges) : []

  return (
    <section className="exercise-card" aria-label="Progreso por músculo">
      <h3>Progreso por músculo</h3>

      <label className="field">
        Músculo
        <select value={muscle} onChange={(event) => setMuscle(event.target.value as Muscle)}>
          <option value="">Elegir músculo…</option>
          {MUSCLES.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
            </option>
          ))}
        </select>
      </label>

      {series.length > 0 && (
        <>
          <p className="muted">Series directas por semana</p>
          <BarChart data={series.map((point) => ({ label: point.range.start, value: point.directSets }))} />

          <p className="muted">Series indirectas por semana</p>
          <BarChart data={series.map((point) => ({ label: point.range.start, value: point.indirectSets }))} />

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Series directas</th>
                  <th>Series indirectas</th>
                  <th>Sesiones</th>
                </tr>
              </thead>
              <tbody>
                {series.map((point) => (
                  <tr key={point.range.start}>
                    <td>
                      {point.range.start} – {point.range.end}
                    </td>
                    <td>{point.directSets}</td>
                    <td>{point.indirectSets}</td>
                    <td>{point.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
