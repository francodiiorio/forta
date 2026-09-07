import { describe, expect, it } from 'vitest'
import type { Exercise } from '../domain/exercise/exercise'
import type { Workout } from '../domain/workout/workout'
import { getDailyStats, getMonthlyStats } from './stats'

const bench: Exercise = {
  id: 'bench',
  name: 'Bench Press',
  primaryMuscles: ['CHEST'],
  secondaryMuscles: ['TRICEPS'],
  equipment: 'BARBELL',
  trackingType: 'WEIGHT_REPS',
  laterality: 'BILATERAL',
  category: 'COMPOUND',
}

const exerciseById = new Map([['bench', bench]])

function makeWorkout(dateOnly: string): Workout {
  return {
    id: dateOnly,
    startedAt: `${dateOnly}T00:00:00.000Z`,
    completedAt: `${dateOnly}T00:00:00.000Z`,
    exercises: [
      { id: `${dateOnly}-we`, exerciseId: 'bench', sets: [{ id: `${dateOnly}-s`, weight: 80, reps: 8, type: 'WORKING', completed: true }] },
    ],
  }
}

describe('getDailyStats / getMonthlyStats', () => {
  const workouts = [makeWorkout('2026-03-01'), makeWorkout('2026-03-15'), makeWorkout('2026-04-01')]

  it('scopes to exactly one day', () => {
    const stats = getDailyStats(workouts, exerciseById, '2026-03-15')

    expect(stats.sessionCount).toBe(1)
    expect(stats.totalVolume).toBe(640)
    expect(stats.muscleWorkload.get('CHEST')).toEqual({ directSets: 1, indirectSets: 0 })
  })

  it('scopes to the whole month, excluding sessions outside it', () => {
    const stats = getMonthlyStats(workouts, exerciseById, '2026-03-20')

    expect(stats.sessionCount).toBe(2)
    expect(stats.totalVolume).toBe(1280)
    expect(stats.range).toEqual({ start: '2026-03-01', end: '2026-03-31' })
  })
})
