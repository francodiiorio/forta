import { describe, expect, it } from 'vitest'
import { requiresDuration, requiresReps, requiresWeight, type TrackingType } from './trackingType'

describe('requiresWeight', () => {
  it.each<[TrackingType, boolean]>([
    ['WEIGHT_REPS', true],
    ['ASSISTED_BODYWEIGHT', true],
    ['BODYWEIGHT_REPS', false],
    ['REPS_ONLY', false],
    ['TIME', false],
  ])('%s -> %s', (trackingType, expected) => {
    expect(requiresWeight(trackingType)).toBe(expected)
  })
})

describe('requiresReps', () => {
  it.each<[TrackingType, boolean]>([
    ['WEIGHT_REPS', true],
    ['BODYWEIGHT_REPS', true],
    ['ASSISTED_BODYWEIGHT', true],
    ['REPS_ONLY', true],
    ['TIME', false],
  ])('%s -> %s', (trackingType, expected) => {
    expect(requiresReps(trackingType)).toBe(expected)
  })
})

describe('requiresDuration', () => {
  it.each<[TrackingType, boolean]>([
    ['TIME', true],
    ['WEIGHT_REPS', false],
    ['BODYWEIGHT_REPS', false],
    ['ASSISTED_BODYWEIGHT', false],
    ['REPS_ONLY', false],
  ])('%s -> %s', (trackingType, expected) => {
    expect(requiresDuration(trackingType)).toBe(expected)
  })
})
