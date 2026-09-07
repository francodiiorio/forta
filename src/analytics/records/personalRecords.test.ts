import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import { calculatePersonalRecords } from './personalRecords'

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

describe('calculatePersonalRecords', () => {
  it('tracks the heaviest completed working set and the best estimated 1RM for WEIGHT_REPS', () => {
    const exercise = makeExercise({ id: 'bench' })
    const workouts = [
      makeWorkout('2026-01-01', 'bench', [{ id: 's1', weight: 80, reps: 8, type: 'WORKING', completed: true }]),
      makeWorkout('2026-01-08', 'bench', [{ id: 's2', weight: 90, reps: 3, type: 'WORKING', completed: true }]),
    ]

    const records = calculatePersonalRecords(exercise, workouts)

    expect(records.maxWeight).toMatchObject({ value: 90, workoutId: '2026-01-08' })
    // 80kg x 8 -> ~101.3 est. 1RM; 90kg x 3 -> 99 est. 1RM. The heaviest
    // set isn't necessarily the best-estimated-1RM set.
    expect(records.estimatedOneRepMax?.workoutId).toBe('2026-01-01')
  })

  it('ignores warm-up sets, incomplete sets, and sets for other exercises', () => {
    const exercise = makeExercise({ id: 'bench' })
    const workouts = [
      makeWorkout('2026-01-01', 'bench', [
        { id: 's1', weight: 200, reps: 1, type: 'WARMUP', completed: true },
        { id: 's2', weight: 200, reps: 1, type: 'WORKING', completed: false },
      ]),
      makeWorkout('2026-01-02', 'squat', [{ id: 's3', weight: 999, reps: 1, type: 'WORKING', completed: true }]),
    ]

    expect(calculatePersonalRecords(exercise, workouts).maxWeight).toBeUndefined()
  })

  it('tracks max reps for BODYWEIGHT_REPS/REPS_ONLY and max duration for TIME', () => {
    const pullUp = makeExercise({ id: 'pullup', trackingType: 'BODYWEIGHT_REPS' })
    const pullUpWorkouts = [makeWorkout('2026-01-01', 'pullup', [{ id: 's1', reps: 12, type: 'WORKING', completed: true }])]
    expect(calculatePersonalRecords(pullUp, pullUpWorkouts).maxReps).toMatchObject({ value: 12 })

    const plank = makeExercise({ id: 'plank', trackingType: 'TIME' })
    const plankWorkouts = [
      makeWorkout('2026-01-01', 'plank', [{ id: 's1', durationSeconds: 60, type: 'WORKING', completed: true }]),
    ]
    expect(calculatePersonalRecords(plank, plankWorkouts).maxDuration).toMatchObject({ value: 60 })
  })

  it('does not compute any record for ASSISTED_BODYWEIGHT (documented gap, see D-025)', () => {
    const assistedDip = makeExercise({ id: 'dip', trackingType: 'ASSISTED_BODYWEIGHT' })
    const workouts = [
      makeWorkout('2026-01-01', 'dip', [{ id: 's1', weight: 20, reps: 8, type: 'WORKING', completed: true }]),
    ]

    expect(calculatePersonalRecords(assistedDip, workouts)).toEqual({})
  })
})
