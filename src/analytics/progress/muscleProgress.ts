import type { Exercise } from '../../domain/exercise/exercise'
import type { Muscle } from '../../domain/muscle/muscle'
import type { Workout } from '../../domain/workout/workout'
import type { Id } from '../../types/common'
import type { DateRange } from '../dateRange'
import { getStatsForRange } from '../stats'

export interface MusclePeriodPoint {
  range: DateRange
  directSets: number
  indirectSets: number
  sessions: number
}

/**
 * Workload (direct/indirect sets) and frequency (sessions) for one
 * muscle, one point per given range, oldest to newest. Deliberately
 * bundled together rather than exposing workload alone: reading "sets
 * are up" without knowing whether frequency also went up is exactly the
 * volume-vs-progress confusion D-004 exists to prevent — the caller
 * (UI) must show both, not just workload.
 */
export function getMuscleProgressSeries(
  muscle: Muscle,
  workouts: Workout[],
  exerciseById: Map<Id, Exercise>,
  ranges: DateRange[],
): MusclePeriodPoint[] {
  return ranges.map((range) => {
    const stats = getStatsForRange(workouts, exerciseById, range)
    const workload = stats.muscleWorkload.get(muscle) ?? { directSets: 0, indirectSets: 0 }
    const frequency = stats.muscleFrequency.get(muscle) ?? { directSessions: 0, indirectOnlySessions: 0 }

    return {
      range,
      directSets: workload.directSets,
      indirectSets: workload.indirectSets,
      sessions: frequency.directSessions + frequency.indirectOnlySessions,
    }
  })
}
