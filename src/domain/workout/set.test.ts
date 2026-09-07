import { describe, expect, it } from 'vitest'
import { isWorkingSet, type SetType } from './set'

describe('isWorkingSet', () => {
  it.each<[SetType, boolean]>([
    ['WORKING', true],
    ['DROPSET', true],
    ['FAILURE', true],
    ['WARMUP', false],
  ])('%s -> %s', (type, expected) => {
    expect(isWorkingSet(type)).toBe(expected)
  })
})
