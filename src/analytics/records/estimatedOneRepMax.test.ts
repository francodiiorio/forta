import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Set as WorkoutSet } from '../../domain/workout/set'
import { estimateOneRepMax } from './estimatedOneRepMax'

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

describe('estimateOneRepMax', () => {
  it('applies the Epley formula: weight × (1 + reps / 30)', () => {
    expect(estimateOneRepMax(makeExercise({}), makeSet({ weight: 100, reps: 5 }))).toBeCloseTo(116.67, 1)
  })

  it('equals the weight itself for a single rep', () => {
    expect(estimateOneRepMax(makeExercise({}), makeSet({ weight: 100, reps: 1 }))).toBeCloseTo(103.33, 1)
  })

  it('is null for non-WEIGHT_REPS exercises', () => {
    expect(estimateOneRepMax(makeExercise({ trackingType: 'BODYWEIGHT_REPS' }), makeSet({}))).toBeNull()
  })

  it('is null for warm-up or incomplete sets', () => {
    expect(estimateOneRepMax(makeExercise({}), makeSet({ type: 'WARMUP' }))).toBeNull()
    expect(estimateOneRepMax(makeExercise({}), makeSet({ completed: false }))).toBeNull()
  })

  it('is null when weight or reps is missing', () => {
    expect(estimateOneRepMax(makeExercise({}), makeSet({ weight: undefined }))).toBeNull()
    expect(estimateOneRepMax(makeExercise({}), makeSet({ reps: undefined }))).toBeNull()
  })
})
