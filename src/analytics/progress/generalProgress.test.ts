import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import { getGeneralProgressOverview } from './generalProgress'

const bench: Exercise = {
  id: 'bench',
  name: 'Bench Press',
  primaryMuscles: ['CHEST'],
  secondaryMuscles: [],
  equipment: 'BARBELL',
  trackingType: 'WEIGHT_REPS',
  laterality: 'BILATERAL',
  category: 'COMPOUND',
}

const exerciseById = new Map([['bench', bench]])

function makeWorkout(dateOnly: string, sessionCount: number): Workout {
  const sets = Array.from({ length: sessionCount }, (_, i) => ({
    id: `${dateOnly}-s${i}`,
    weight: 80,
    reps: 8,
    type: 'WORKING' as const,
    completed: true,
  }))
  return {
    id: dateOnly,
    startedAt: `${dateOnly}T00:00:00.000Z`,
    completedAt: `${dateOnly}T00:00:00.000Z`,
    exercises: [{ id: `${dateOnly}-we`, exerciseId: 'bench', sets }],
  }
}

describe('getGeneralProgressOverview', () => {
  it('reports session count and volume together, never merged into one number', () => {
    // Week 1: one session, 3 sets. Week 2: two sessions, 1 set each.
    // Same total sets (3), different session counts — exactly the case
    // D-004 warns can't be read from volume alone.
    const workouts = [makeWorkout('2026-03-02', 3), makeWorkout('2026-03-09', 1), makeWorkout('2026-03-10', 2)]

    const overview = getGeneralProgressOverview(workouts, exerciseById, [
      { start: '2026-03-02', end: '2026-03-08' },
      { start: '2026-03-09', end: '2026-03-15' },
    ])

    expect(overview).toEqual([
      { range: { start: '2026-03-02', end: '2026-03-08' }, sessionCount: 1, totalVolume: 3 * 640 },
      { range: { start: '2026-03-09', end: '2026-03-15' }, sessionCount: 2, totalVolume: 3 * 640 },
    ])
  })
})
