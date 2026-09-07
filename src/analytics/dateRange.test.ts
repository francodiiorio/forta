import { describe, expect, it } from 'vitest'
import type { Workout } from '../domain/workout/workout'
import { filterWorkoutsByRange, getDayRange, getISOWeekRange, getMonthRange, isDateInRange } from './dateRange'

describe('isDateInRange', () => {
  it('includes both boundaries', () => {
    const range = { start: '2026-03-01', end: '2026-03-31' }
    expect(isDateInRange('2026-03-01', range)).toBe(true)
    expect(isDateInRange('2026-03-31', range)).toBe(true)
    expect(isDateInRange('2026-02-28', range)).toBe(false)
    expect(isDateInRange('2026-04-01', range)).toBe(false)
  })
})

describe('getDayRange', () => {
  it('is a single-day range', () => {
    expect(getDayRange('2026-03-15')).toEqual({ start: '2026-03-15', end: '2026-03-15' })
  })
})

describe('getISOWeekRange', () => {
  it('spans Monday to Sunday for a mid-week date', () => {
    // 2026-03-11 is a Wednesday.
    expect(getISOWeekRange('2026-03-11')).toEqual({ start: '2026-03-09', end: '2026-03-15' })
  })

  it('treats Sunday as the last day of its week, not the first', () => {
    // 2026-03-15 is a Sunday.
    expect(getISOWeekRange('2026-03-15')).toEqual({ start: '2026-03-09', end: '2026-03-15' })
  })

  it('handles a week that crosses a month boundary', () => {
    // 2026-03-02 is a Monday; the prior Sunday is in February.
    expect(getISOWeekRange('2026-03-02')).toEqual({ start: '2026-03-02', end: '2026-03-08' })
    expect(getISOWeekRange('2026-03-01')).toEqual({ start: '2026-02-23', end: '2026-03-01' })
  })
})

describe('getMonthRange', () => {
  it('spans the 1st to the last day of the month', () => {
    expect(getMonthRange('2026-02-15')).toEqual({ start: '2026-02-01', end: '2026-02-28' })
  })

  it('handles a leap-year February', () => {
    expect(getMonthRange('2028-02-10')).toEqual({ start: '2028-02-01', end: '2028-02-29' })
  })

  it('handles a 31-day month', () => {
    expect(getMonthRange('2026-01-05')).toEqual({ start: '2026-01-01', end: '2026-01-31' })
  })
})

function makeWorkout(startedAt: string): Workout {
  return { id: startedAt, startedAt, completedAt: startedAt, exercises: [] }
}

describe('filterWorkoutsByRange', () => {
  it('keeps only workouts whose date falls in the range', () => {
    const workouts = [
      makeWorkout('2026-03-01T10:00:00.000Z'),
      makeWorkout('2026-03-15T10:00:00.000Z'),
      makeWorkout('2026-04-01T10:00:00.000Z'),
    ]

    const result = filterWorkoutsByRange(workouts, { start: '2026-03-01', end: '2026-03-31' })

    expect(result.map((w) => w.id)).toEqual(['2026-03-01T10:00:00.000Z', '2026-03-15T10:00:00.000Z'])
  })
})
