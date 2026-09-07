import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import { calculateMuscleWorkload } from './muscleWorkload'

// Bench Press, as documented in docs/FITNESS_DOMAIN.md.
const benchPress: Exercise = {
  id: 'bench',
  name: 'Bench Press',
  primaryMuscles: ['CHEST'],
  secondaryMuscles: ['TRICEPS', 'ANTERIOR_DELTOID'],
  equipment: 'BARBELL',
  trackingType: 'WEIGHT_REPS',
  laterality: 'BILATERAL',
  category: 'COMPOUND',
}

const exerciseById = new Map([['bench', benchPress]])

describe('calculateMuscleWorkload', () => {
  it('counts direct sets for primary muscles and indirect involvement for secondary muscles', () => {
    const workouts: Workout[] = [
      {
        id: 'w1',
        startedAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:00:00.000Z',
        exercises: [
          {
            id: 'we1',
            exerciseId: 'bench',
            sets: [
              { id: 's1', weight: 80, reps: 8, type: 'WORKING', completed: true },
              { id: 's2', weight: 80, reps: 8, type: 'WORKING', completed: true },
              { id: 's3', weight: 80, reps: 8, type: 'WORKING', completed: true },
            ],
          },
        ],
      },
    ]

    const result = calculateMuscleWorkload(workouts, exerciseById)

    expect(result.get('CHEST')).toEqual({ directSets: 3, indirectSets: 0 })
    expect(result.get('TRICEPS')).toEqual({ directSets: 0, indirectSets: 3 })
    expect(result.get('ANTERIOR_DELTOID')).toEqual({ directSets: 0, indirectSets: 3 })
  })

  it('excludes warm-up sets', () => {
    const workouts: Workout[] = [
      {
        id: 'w1',
        startedAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:00:00.000Z',
        exercises: [
          {
            id: 'we1',
            exerciseId: 'bench',
            sets: [{ id: 's1', weight: 40, reps: 10, type: 'WARMUP', completed: true }],
          },
        ],
      },
    ]

    const result = calculateMuscleWorkload(workouts, exerciseById)

    expect(result.get('CHEST')).toBeUndefined()
  })
})
