import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Workout } from '../../domain/workout/workout'
import { calculateMuscleFrequency, calculateTrainingFrequency } from './trainingFrequency'

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

const tricepsPushdown: Exercise = {
  id: 'pushdown',
  name: 'Triceps Pushdown',
  primaryMuscles: ['TRICEPS'],
  secondaryMuscles: [],
  equipment: 'CABLE',
  trackingType: 'WEIGHT_REPS',
  laterality: 'BILATERAL',
  category: 'ISOLATION',
}

const exerciseById = new Map([
  ['bench', benchPress],
  ['pushdown', tricepsPushdown],
])

function makeWorkout(id: string, exerciseId: string): Workout {
  return {
    id,
    startedAt: `${id}T00:00:00.000Z`,
    completedAt: `${id}T00:00:00.000Z`,
    exercises: [
      {
        id: `${id}-we`,
        exerciseId,
        sets: [{ id: `${id}-s`, weight: 50, reps: 8, type: 'WORKING', completed: true }],
      },
    ],
  }
}

describe('calculateTrainingFrequency', () => {
  it('counts one per session regardless of set count', () => {
    expect(calculateTrainingFrequency([makeWorkout('2026-01-01', 'bench'), makeWorkout('2026-01-03', 'bench')])).toBe(
      2,
    )
  })
})

describe('calculateMuscleFrequency', () => {
  it('counts a session with only indirect involvement separately from direct sessions', () => {
    // Session 1: bench press — chest direct, triceps indirect.
    // Session 2: triceps pushdown — triceps direct.
    const workouts = [makeWorkout('2026-01-01', 'bench'), makeWorkout('2026-01-03', 'pushdown')]

    const result = calculateMuscleFrequency(workouts, exerciseById)

    expect(result.get('CHEST')).toEqual({ directSessions: 1, indirectOnlySessions: 0 })
    // Triceps: direct in session 2, indirect-only in session 1 — one of each.
    expect(result.get('TRICEPS')).toEqual({ directSessions: 1, indirectOnlySessions: 1 })
  })

  it('does not double-count a muscle as indirect-only when it also got a direct set in the same session', () => {
    const workout: Workout = {
      id: 'w1',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.000Z',
      exercises: [
        { id: 'we1', exerciseId: 'bench', sets: [{ id: 's1', weight: 50, reps: 8, type: 'WORKING', completed: true }] },
        {
          id: 'we2',
          exerciseId: 'pushdown',
          sets: [{ id: 's2', weight: 20, reps: 12, type: 'WORKING', completed: true }],
        },
      ],
    }

    const result = calculateMuscleFrequency([workout], exerciseById)

    // Triceps got both indirect (bench) and direct (pushdown) involvement
    // in the same session — it must count only as a direct session.
    expect(result.get('TRICEPS')).toEqual({ directSessions: 1, indirectOnlySessions: 0 })
  })
})
