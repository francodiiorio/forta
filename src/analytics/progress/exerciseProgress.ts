import type { Exercise } from '../../domain/exercise/exercise'
import { isWorkingSet } from '../../domain/workout/set'
import type { Workout } from '../../domain/workout/workout'
import type { Id, ISODateTimeString } from '../../types/common'
import { estimateOneRepMax } from '../records/estimatedOneRepMax'

export type PerformanceMetric = 'ESTIMATED_1RM' | 'MAX_REPS' | 'MAX_DURATION'

export interface PerformancePoint {
  workoutId: Id
  date: ISODateTimeString
  value: number
  metric: PerformanceMetric
}

/**
 * One point per session the exercise was performed in — its best
 * qualifying completed working set that session — ordered oldest to
 * newest. This *is* exercise progress: a trend to read, not a single
 * "+X%" figure. Performance (unlike volume) isn't confounded by
 * frequency, so a rising trend here is a defensible progression signal
 * on its own — see docs/ANALYTICS.md and D-004.
 *
 * `ASSISTED_BODYWEIGHT` produces no points: there's no bodyweight data
 * to normalize "less assistance" against, same reasoning as its missing
 * PR (D-025).
 */
export function getExerciseProgressSeries(exercise: Exercise, workouts: Workout[]): PerformancePoint[] {
  const points: PerformancePoint[] = []

  for (const workout of workouts) {
    let best: number | undefined
    let metric: PerformanceMetric | undefined

    for (const workoutExercise of workout.exercises) {
      if (workoutExercise.exerciseId !== exercise.id) continue

      for (const set of workoutExercise.sets) {
        if (!isWorkingSet(set.type) || !set.completed) continue

        if (exercise.trackingType === 'WEIGHT_REPS') {
          const oneRepMax = estimateOneRepMax(exercise, set)
          if (oneRepMax !== null && (best === undefined || oneRepMax > best)) {
            best = oneRepMax
            metric = 'ESTIMATED_1RM'
          }
        } else if (exercise.trackingType === 'BODYWEIGHT_REPS' || exercise.trackingType === 'REPS_ONLY') {
          if (set.reps !== undefined && (best === undefined || set.reps > best)) {
            best = set.reps
            metric = 'MAX_REPS'
          }
        } else if (exercise.trackingType === 'TIME') {
          if (set.durationSeconds !== undefined && (best === undefined || set.durationSeconds > best)) {
            best = set.durationSeconds
            metric = 'MAX_DURATION'
          }
        }
      }
    }

    if (best !== undefined && metric) {
      points.push({ workoutId: workout.id, date: workout.startedAt, value: best, metric })
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date))
}
