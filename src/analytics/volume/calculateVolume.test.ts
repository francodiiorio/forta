import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Set as WorkoutSet } from '../../domain/workout/set'
import type { Workout } from '../../domain/workout/workout'
import { calculateSetVolume, calculateTotalVolume, calculateVolumeByExercise } from './calculateVolume'

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

function makeSet(overrides: Partial<WorkoutSet>): WorkoutSet {
  return { id: 's-1', weight: 100, reps: 5, type: 'WORKING', completed: true, ...overrides }
}

describe('calculateSetVolume', () => {
  it('multiplies weight by reps for a WEIGHT_REPS working set', () => {
    expect(calculateSetVolume(makeExercise({}), makeSet({}))).toBe(500)
  })

  it('is zero for a warm-up set', () => {
    expect(calculateSetVolume(makeExercise({}), makeSet({ type: 'WARMUP' }))).toBe(0)
  })

  it.each<Exercise['trackingType']>(['BODYWEIGHT_REPS', 'ASSISTED_BODYWEIGHT', 'REPS_ONLY', 'TIME'])(
    'is zero for %s (only WEIGHT_REPS counts toward volume)',
    (trackingType) => {
      expect(calculateSetVolume(makeExercise({ trackingType }), makeSet({}))).toBe(0)
    },
  )

  it('is zero when weight or reps is missing', () => {
    expect(calculateSetVolume(makeExercise({}), makeSet({ weight: undefined }))).toBe(0)
    expect(calculateSetVolume(makeExercise({}), makeSet({ reps: undefined }))).toBe(0)
  })
})

describe('calculateTotalVolume / calculateVolumeByExercise', () => {
  it('sums volume across workouts and exercises', () => {
    const bench = makeExercise({ id: 'bench' })
    const squat = makeExercise({ id: 'squat' })
    const exerciseById = new Map([
      ['bench', bench],
      ['squat', squat],
    ])

    const workouts: Workout[] = [
      {
        id: 'w1',
        startedAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:00:00.000Z',
        exercises: [
          { id: 'we1', exerciseId: 'bench', sets: [makeSet({ id: 's1', weight: 100, reps: 5 })] },
          { id: 'we2', exerciseId: 'squat', sets: [makeSet({ id: 's2', weight: 150, reps: 5 })] },
        ],
      },
      {
        id: 'w2',
        startedAt: '2026-01-03T00:00:00.000Z',
        completedAt: '2026-01-03T00:00:00.000Z',
        exercises: [{ id: 'we3', exerciseId: 'bench', sets: [makeSet({ id: 's3', weight: 100, reps: 5 })] }],
      },
    ]

    expect(calculateTotalVolume(workouts, exerciseById)).toBe(500 + 750 + 500)
    expect(calculateVolumeByExercise(workouts, exerciseById)).toEqual(
      new Map([
        ['bench', 1000],
        ['squat', 750],
      ]),
    )
  })
})
