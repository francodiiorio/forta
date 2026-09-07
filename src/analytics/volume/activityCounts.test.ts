import { describe, expect, it } from 'vitest'
import type { Workout } from '../../domain/workout/workout'
import { calculateDailySetCounts, calculateTotalSets } from './activityCounts'

function makeWorkout(dateOnly: string, setCounts: number[]): Workout {
  return {
    id: dateOnly,
    startedAt: `${dateOnly}T00:00:00.000Z`,
    completedAt: `${dateOnly}T00:00:00.000Z`,
    exercises: setCounts.map((count, exerciseIndex) => ({
      id: `${dateOnly}-we${exerciseIndex}`,
      exerciseId: 'ex-1',
      sets: Array.from({ length: count }, (_, setIndex) => ({
        id: `${dateOnly}-${exerciseIndex}-${setIndex}`,
        type: 'WORKING' as const,
        completed: true,
      })),
    })),
  }
}

describe('calculateTotalSets', () => {
  it('counts every set across every workout and exercise, including warm-ups', () => {
    const workouts = [makeWorkout('2026-01-01', [3, 2]), makeWorkout('2026-01-02', [1])]
    expect(calculateTotalSets(workouts)).toBe(6)
  })

  it('is zero for no workouts', () => {
    expect(calculateTotalSets([])).toBe(0)
  })
})

describe('calculateDailySetCounts', () => {
  it('sums sets per date within the range, excluding dates outside it', () => {
    const workouts = [makeWorkout('2026-03-02', [3]), makeWorkout('2026-03-03', [2, 1]), makeWorkout('2026-04-01', [9])]

    const counts = calculateDailySetCounts(workouts, { start: '2026-03-01', end: '2026-03-31' })

    expect(counts).toEqual({ '2026-03-02': 3, '2026-03-03': 3 })
  })
})
