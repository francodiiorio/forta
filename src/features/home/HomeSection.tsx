import { ActivityHeatmap } from '../../components/ActivityHeatmap'
import { BarChart } from '../../components/BarChart'
import { CheckCircleIcon } from '../../components/icons'
import { getISOWeekRange, getLastNWeekRanges } from '../../analytics/dateRange'
import { getGeneralProgressOverview } from '../../analytics/progress/generalProgress'
import { calculateDailySetCounts, calculateTotalSets } from '../../analytics/volume/activityCounts'
import { calculateTotalVolume } from '../../analytics/volume/calculateVolume'
import { useWorkouts } from '../../hooks/useWorkouts'
import { formatNumber } from '../../utils/format'
import { BodyWeightCard } from '../body/BodyWeightCard'
import type { ExercisesApi } from '../exercises/useExercises'

interface HomeSectionProps {
  exercisesApi: ExercisesApi
  onGoToWorkout: () => void
}

const WEEKS_SHOWN = 8
const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'] as const

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateOnly: string, days: number): string {
  const date = new Date(`${dateOnly}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Dashboard: today's status, lifetime totals, recent activity, volume
 * trend, this week's sets, and body weight. Every number here reuses an
 * existing analytics function — this component only arranges them.
 *
 * Loads its own workouts (see HistorySection for why this isn't lifted
 * like `exercisesApi` is — D-029) so a workout saved elsewhere shows up
 * here as soon as this tab is opened.
 */
export function HomeSection({ exercisesApi, onGoToWorkout }: HomeSectionProps) {
  const { workouts, loading } = useWorkouts()

  if (loading || exercisesApi.loading) {
    return (
      <div aria-label="Inicio">
        <h1 className="page-title">Forta</h1>
        <p className="muted">Cargando…</p>
      </div>
    )
  }

  const exerciseById = new Map(exercisesApi.exercises.map((exercise) => [exercise.id, exercise]))
  const today = todayDateOnly()
  const todayWorkout = workouts.find((workout) => workout.startedAt.slice(0, 10) === today)

  const totalVolume = calculateTotalVolume(workouts, exerciseById)
  const activeDates = new Set(workouts.map((workout) => workout.startedAt.slice(0, 10)))

  const weekRanges = getLastNWeekRanges(today, WEEKS_SHOWN)
  const overview = getGeneralProgressOverview(workouts, exerciseById, weekRanges)

  const currentWeekRange = getISOWeekRange(today)
  const dailySets = calculateDailySetCounts(workouts, currentWeekRange)
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(currentWeekRange.start, index))

  return (
    <div aria-label="Inicio">
      <h1 className="page-title">Forta</h1>

      <section className="card today-card" aria-label="Entrenamiento de hoy">
        <div className="today-card-header">
          <span className="muted">Hoy</span>
          {todayWorkout && (
            <span className="badge badge-success">
              <CheckCircleIcon className="icon-inline" /> Completado
            </span>
          )}
        </div>

        {todayWorkout ? (
          <>
            <h2>{todayWorkout.exercises.map((we) => exerciseById.get(we.exerciseId)?.name ?? '?').join(', ')}</h2>
            <div className="button-group">
              <span className="chip">
                {todayWorkout.exercises.reduce((sum, we) => sum + we.sets.length, 0)} series
              </span>
              <span className="chip">{formatNumber(calculateTotalVolume([todayWorkout], exerciseById))} kg</span>
            </div>
          </>
        ) : (
          <h2>Todavía no registraste un entrenamiento</h2>
        )}

        <button type="button" className="button-primary" onClick={onGoToWorkout}>
          {todayWorkout ? 'Registrar otro entrenamiento' : 'Registrar entrenamiento'}
        </button>
      </section>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{workouts.length}</span>
          <span className="stat-label">entrenamientos</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{calculateTotalSets(workouts)}</span>
          <span className="stat-label">series</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatNumber(totalVolume)}</span>
          <span className="stat-label">kg totales</span>
        </div>
      </div>

      <section className="card" aria-label="Actividad reciente">
        <h3>Últimos 30 días</h3>
        <ActivityHeatmap activeDates={activeDates} days={30} />
      </section>

      <section className="card" aria-label="Volumen">
        <h3>Volumen ({WEEKS_SHOWN} semanas)</h3>
        <BarChart data={overview.map((point) => ({ label: point.range.start, value: point.totalVolume }))} />
      </section>

      <section className="card" aria-label="Esta semana">
        <h3>Series esta semana</h3>
        <BarChart data={weekDates.map((date) => ({ label: date, value: dailySets[date] ?? 0 }))} />
        <div className="week-labels">
          {weekDates.map((date) => (
            <span key={date}>{WEEKDAY_LABELS[new Date(`${date}T00:00:00Z`).getUTCDay()]}</span>
          ))}
        </div>
      </section>

      <BodyWeightCard />
    </div>
  )
}
