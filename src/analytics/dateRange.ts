import type { Workout } from '../domain/workout/workout'

/**
 * Inclusive date range, both ends as "YYYY-MM-DD". Comparisons are done
 * on the date substring of ISODateTimeString, not with timezone-aware
 * Date arithmetic — see docs/DECISIONS.md D-026.
 */
export interface DateRange {
  start: string
  end: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toDateString(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function parseDateString(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function isDateInRange(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end
}

export function getDayRange(date: string): DateRange {
  return { start: date, end: date }
}

/** Monday-to-Sunday, per ISO 8601 — see docs/DECISIONS.md D-026. */
export function getISOWeekRange(date: string): DateRange {
  const parsed = parseDateString(date)
  const isoDayOfWeek = parsed.getUTCDay() === 0 ? 7 : parsed.getUTCDay()

  const monday = new Date(parsed)
  monday.setUTCDate(parsed.getUTCDate() - (isoDayOfWeek - 1))

  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

  return { start: toDateString(monday), end: toDateString(sunday) }
}

export function getMonthRange(date: string): DateRange {
  const [year, month] = date.split('-').map(Number)
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0))

  return { start: `${date.slice(0, 7)}-01`, end: toDateString(lastDayOfMonth) }
}

/** Workouts whose `startedAt` date falls within the (inclusive) range. */
export function filterWorkoutsByRange(workouts: Workout[], range: DateRange): Workout[] {
  return workouts.filter((workout) => isDateInRange(workout.startedAt.slice(0, 10), range))
}
