import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import { getMuscleProgressSeries } from './muscleProgress'

const benchPress: Exercise = {
  id: 'bench',
  name: 'Bench Press',
  primaryMuscles: ['CHEST'],
  secondaryMuscles: ['TRICEPS'],
  equipment: 'BARBELL',
  trackingType: 'WEIGHT_REPS',
  laterality: 'BILATERAL',
  category: 'COMPOUND',
}

const exerciseById = new Map([['bench', benchPress]])

function makeWorkout(dateOnly: string): Workout {
  return {
    id: dateOnly,
    startedAt: `${dateOnly}T00:00:00.000Z`,
    completedAt: `${dateOnly}T00:00:00.000Z`,
    exercises: [
      {
        id: `${dateOnly}-we`,
        exerciseId: 'bench',
        sets: [{ id: `${dateOnly}-s`, weight: 80, reps: 8, type: 'WORKING', completed: true }],
      },
    ],
  }
}

describe('getMuscleProgressSeries', () => {
  it('reports workload and frequency together, per range', () => {
    const workouts = [makeWorkout('2026-03-02'), makeWorkout('2026-03-04'), makeWorkout('2026-03-09')]

    const series = getMuscleProgressSeries('CHEST', workouts, exerciseById, [
      { start: '2026-03-02', end: '2026-03-08' },
      { start: '2026-03-09', end: '2026-03-15' },
    ])

    expect(series).toEqual([
      { range: { start: '2026-03-02', end: '2026-03-08' }, directSets: 2, indirectSets: 0, sessions: 2 },
      { range: { start: '2026-03-09', end: '2026-03-15' }, directSets: 1, indirectSets: 0, sessions: 1 },
    ])
  })

  it('reports indirect involvement for a secondary muscle separately', () => {
    const series = getMuscleProgressSeries('TRICEPS', [makeWorkout('2026-03-02')], exerciseById, [
      { start: '2026-03-02', end: '2026-03-08' },
    ])

    expect(series).toEqual([{ range: { start: '2026-03-02', end: '2026-03-08' }, directSets: 0, indirectSets: 1, sessions: 1 }])
  })

  it('returns zeros for a range with no relevant training', () => {
    const series = getMuscleProgressSeries('QUADRICEPS', [makeWorkout('2026-03-02')], exerciseById, [
      { start: '2026-03-02', end: '2026-03-08' },
    ])

    expect(series).toEqual([{ range: { start: '2026-03-02', end: '2026-03-08' }, directSets: 0, indirectSets: 0, sessions: 0 }])
  })
})
