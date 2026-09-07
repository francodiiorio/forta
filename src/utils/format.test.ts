import { describe, expect, it } from 'vitest'
import { formatNumber } from './format'

describe('formatNumber', () => {
  it('rounds to one decimal place', () => {
    expect(formatNumber(101.33333333333333)).toBe('101.3')
  })

  it('drops a trailing .0', () => {
    expect(formatNumber(640)).toBe('640')
    expect(formatNumber(99.0)).toBe('99')
  })

  it('rounds up correctly', () => {
    expect(formatNumber(101.98)).toBe('102')
  })
})
