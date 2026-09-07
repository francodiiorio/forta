import type { Exercise } from '../domain/exercise/exercise'
import type { Muscle } from '../domain/muscle/muscle'
import type { Workout } from '../domain/workout/workout'
import type { Id } from '../types/common'
import { type DateRange, filterWorkoutsByRange, getDayRange, getISOWeekRange, getMonthRange } from './dateRange'
import { calculateMuscleFrequency, calculateTrainingFrequency, type MuscleFrequency } from './frequency/trainingFrequency'
import { calculateMuscleWorkload, type MuscleWorkload } from './muscles/muscleWorkload'
import { calculateTotalVolume, calculateVolumeByExercise } from './volume/calculateVolume'

/**
 * Period rollups aren't a fifth analytics category — they're workload
 * and frequency, composed over a date range. See docs/ANALYTICS.md.
 * No progression/comparison here: that's Stage 7, and comparing two
 * `PeriodStats` naively (e.g. a bare volume delta) is exactly what
 * docs/DECISIONS.md D-004 warns against.
 */
export interface PeriodStats {
  range: DateRange
  sessionCount: number
  totalVolume: number
  volumeByExercise: Map<Id, number>
  muscleWorkload: Map<Muscle, MuscleWorkload>
  muscleFrequency: Map<Muscle, MuscleFrequency>
}

export function getStatsForRange(
  workouts: Workout[],
  exerciseById: Map<Id, Exercise>,
  range: DateRange,
): PeriodStats {
  const workoutsInRange = filterWorkoutsByRange(workouts, range)

  return {
    range,
    sessionCount: calculateTrainingFrequency(workoutsInRange),
    totalVolume: calculateTotalVolume(workoutsInRange, exerciseById),
    volumeByExercise: calculateVolumeByExercise(workoutsInRange, exerciseById),
    muscleWorkload: calculateMuscleWorkload(workoutsInRange, exerciseById),
    muscleFrequency: calculateMuscleFrequency(workoutsInRange, exerciseById),
  }
}

export function getDailyStats(workouts: Workout[], exerciseById: Map<Id, Exercise>, date: string): PeriodStats {
  return getStatsForRange(workouts, exerciseById, getDayRange(date))
}

export function getWeeklyStats(workouts: Workout[], exerciseById: Map<Id, Exercise>, date: string): PeriodStats {
  return getStatsForRange(workouts, exerciseById, getISOWeekRange(date))
}

export function getMonthlyStats(workouts: Workout[], exerciseById: Map<Id, Exercise>, date: string): PeriodStats {
  return getStatsForRange(workouts, exerciseById, getMonthRange(date))
}
