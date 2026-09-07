import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import type { Id } from '../../types/common'
import type { DateRange } from '../dateRange'
import { getStatsForRange } from '../stats'

export interface PeriodOverview {
  range: DateRange
  sessionCount: number
  totalVolume: number
}

/**
 * Session count and total volume, one point per given range, oldest to
 * newest — never collapsed into a single score. This is the dashboard-
 * level "general progress" view: it exists specifically so workload
 * (`totalVolume`) is never read without frequency (`sessionCount`) right
 * next to it, per D-004.
 */
export function getGeneralProgressOverview(
  workouts: Workout[],
  exerciseById: Map<Id, Exercise>,
  ranges: DateRange[],
): PeriodOverview[] {
  return ranges.map((range) => {
    const stats = getStatsForRange(workouts, exerciseById, range)
    return { range, sessionCount: stats.sessionCount, totalVolume: stats.totalVolume }
  })
}
