import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import { getExerciseProgressSeries } from './exerciseProgress'

function makeExercise(overrides: Partial<Exercise>): Exercise {
  return {
    id: 'ex-1',
    name: 'Test Exercise',
    primaryMuscles: ['CHEST'],
    secondaryMuscles: [],
    equipment: 'BARBELL',
    trackingType: 'WEIGHT_REPS',
    laterality: 'BILATERAL',
    category: 'COMPOUND',
    ...overrides,
  }
}

function makeWorkout(id: string, exerciseId: string, sets: Workout['exercises'][number]['sets']): Workout {
  return {
    id,
    startedAt: `${id}T00:00:00.000Z`,
    completedAt: `${id}T00:00:00.000Z`,
    exercises: [{ id: `${id}-we`, exerciseId, sets }],
  }
}

describe('getExerciseProgressSeries', () => {
  it('picks the best estimated 1RM per session for WEIGHT_REPS, ordered oldest to newest', () => {
    const exercise = makeExercise({ id: 'bench' })
    const workouts = [
      makeWorkout('2026-01-08', 'bench', [{ id: 's2', weight: 90, reps: 3, type: 'WORKING', completed: true }]),
      makeWorkout('2026-01-01', 'bench', [
        { id: 's1a', weight: 70, reps: 8, type: 'WORKING', completed: true },
        { id: 's1b', weight: 80, reps: 8, type: 'WORKING', completed: true },
      ]),
    ]

    const series = getExerciseProgressSeries(exercise, workouts)

    expect(series.map((p) => p.workoutId)).toEqual(['2026-01-01', '2026-01-08'])
    expect(series[0].metric).toBe('ESTIMATED_1RM')
    // Best of the two sets in the first session is 80kg x 8.
    expect(series[0].value).toBeCloseTo(80 * (1 + 8 / 30), 5)
  })

  it('uses max reps for BODYWEIGHT_REPS/REPS_ONLY and max duration for TIME', () => {
    const pullUp = makeExercise({ id: 'pullup', trackingType: 'BODYWEIGHT_REPS' })
    const pullUpSeries = getExerciseProgressSeries(pullUp, [
      makeWorkout('2026-01-01', 'pullup', [{ id: 's1', reps: 10, type: 'WORKING', completed: true }]),
    ])
    expect(pullUpSeries[0]).toMatchObject({ value: 10, metric: 'MAX_REPS' })

    const plank = makeExercise({ id: 'plank', trackingType: 'TIME' })
    const plankSeries = getExerciseProgressSeries(plank, [
      makeWorkout('2026-01-01', 'plank', [{ id: 's1', durationSeconds: 45, type: 'WORKING', completed: true }]),
    ])
    expect(plankSeries[0]).toMatchObject({ value: 45, metric: 'MAX_DURATION' })
  })

  it('produces no points for ASSISTED_BODYWEIGHT (no defensible "best" — see D-025)', () => {
    const dip = makeExercise({ id: 'dip', trackingType: 'ASSISTED_BODYWEIGHT' })
    const series = getExerciseProgressSeries(dip, [
      makeWorkout('2026-01-01', 'dip', [{ id: 's1', weight: 20, reps: 8, type: 'WORKING', completed: true }]),
    ])

    expect(series).toEqual([])
  })

  it('skips sessions with no completed working set for this exercise', () => {
    const exercise = makeExercise({ id: 'bench' })
    const series = getExerciseProgressSeries(exercise, [
      makeWorkout('2026-01-01', 'bench', [{ id: 's1', weight: 80, reps: 8, type: 'WARMUP', completed: true }]),
    ])

    expect(series).toEqual([])
  })
})
