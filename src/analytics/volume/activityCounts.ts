import type { Workout } from '../../domain/workout/workout'
import { type DateRange, filterWorkoutsByRange } from '../dateRange'

/** Every logged set across all workouts, including warm-ups — a raw activity count, not a workload judgment. */
export function calculateTotalSets(workouts: Workout[]): number {
  return workouts.reduce(
    (sum, workout) => sum + workout.exercises.reduce((setSum, we) => setSum + we.sets.length, 0),
    0,
  )
}

/** Total sets logged per day within a range — for a "this week" activity chart. */
export function calculateDailySetCounts(workouts: Workout[], range: DateRange): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const workout of filterWorkoutsByRange(workouts, range)) {
    const date = workout.startedAt.slice(0, 10)
    const setCount = workout.exercises.reduce((sum, we) => sum + we.sets.length, 0)
    counts[date] = (counts[date] ?? 0) + setCount
  }

  return counts
}
