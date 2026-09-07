import { describe, expect, it } from 'vitest'
import type { Exercise } from '../exercise/exercise'
import type { Set } from '../workout/set'
import { classifySetInvolvement } from './muscleInvolvement'

// Bench Press, as documented in docs/FITNESS_DOMAIN.md.
const benchPress: Exercise = {
  id: 'ex-1',
  name: 'Bench Press',
  primaryMuscles: ['CHEST'],
  secondaryMuscles: ['TRICEPS', 'ANTERIOR_DELTOID'],
  equipment: 'BARBELL',
  trackingType: 'WEIGHT_REPS',
  laterality: 'BILATERAL',
  category: 'COMPOUND',
}

function makeSet(overrides: Partial<Set>): Set {
  return {
    id: 'set-1',
    weight: 80,
    reps: 8,
    type: 'WORKING',
    completed: true,
    ...overrides,
  }
}

describe('classifySetInvolvement', () => {
  it('counts a direct set for primary muscles and indirect involvement for secondary muscles', () => {
    const result = classifySetInvolvement(benchPress, makeSet({}))

    expect(result).toEqual({
      direct: ['CHEST'],
      indirect: ['TRICEPS', 'ANTERIOR_DELTOID'],
    })
  })

  it('classifies dropsets and failure sets the same as working sets', () => {
    expect(classifySetInvolvement(benchPress, makeSet({ type: 'DROPSET' }))).not.toBeNull()
    expect(classifySetInvolvement(benchPress, makeSet({ type: 'FAILURE' }))).not.toBeNull()
  })

  it('returns null for warm-up sets — they count toward neither direct nor indirect involvement', () => {
    const result = classifySetInvolvement(benchPress, makeSet({ type: 'WARMUP' }))

    expect(result).toBeNull()
  })

  it('never assigns a fractional weight to indirect involvement', () => {
    const result = classifySetInvolvement(benchPress, makeSet({}))

    // Indirect involvement is the full secondary-muscle list, not a
    // scaled-down subset or a percentage — see D-003.
    expect(result?.indirect).toHaveLength(benchPress.secondaryMuscles.length)
  })
})
