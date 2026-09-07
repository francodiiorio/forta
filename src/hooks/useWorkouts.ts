import { useCallback, useEffect, useState } from 'react'
import type { Workout } from '../domain/workout/workout'
import { workoutRepository } from '../persistence/repositories/workoutRepository'

export interface WorkoutsApi {
  workouts: Workout[]
  loading: boolean
  reload: () => Promise<void>
}

/**
 * Loads all workouts, most recent first. IndexedDB's getAll() returns
 * records in primary-key order (a random id), not chronological order,
 * so sorting by startedAt happens here — this is display ordering of
 * stored facts, not a derived statistic.
 *
 * Lives in `src/hooks` (not a feature folder) because both the history
 * and progress features need it — same reasoning as `useExercises` in
 * D-018: one shared load, called once in App and passed down, instead of
 * two independent copies that could drift within a session.
 */
export function useWorkouts(): WorkoutsApi {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const all = await workoutRepository.getAll()
    setWorkouts([...all].sort((a, b) => b.startedAt.localeCompare(a.startedAt)))
    setLoading(false)
  }, [])

  // Loading from IndexedDB on mount; reload's state updates happen after
  // its `await`, not synchronously (see useExercises for the longer version).
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- see above
    reload()
  }, [reload])

  return { workouts, loading, reload }
}
