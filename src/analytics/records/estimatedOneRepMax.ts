import type { Exercise } from '../../domain/exercise/exercise'
import { isWorkingSet, type Set as WorkoutSet } from '../../domain/workout/set'

/**
 * Epley formula: 1RM ≈ weight × (1 + reps / 30). Chosen over alternatives
 * (Brzycki, Lombardi, ...) for being the most commonly cited and simplest
 * to state; like any such formula it's a rough estimate that degrades at
 * high rep counts, never a measured value. `WEIGHT_REPS` only — see
 * docs/ANALYTICS.md and docs/FITNESS_DOMAIN.md.
 */
export function estimateOneRepMax(exercise: Exercise, set: WorkoutSet): number | null {
  if (exercise.trackingType !== 'WEIGHT_REPS') return null
  if (!isWorkingSet(set.type) || !set.completed) return null
  if (set.weight === undefined || set.reps === undefined || set.reps <= 0) return null

  return set.weight * (1 + set.reps / 30)
}
