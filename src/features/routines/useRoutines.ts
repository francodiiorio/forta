import { useCallback, useEffect, useState } from 'react'
import type { Routine, RoutineExercise } from '../../domain/routine/routine'
import { routineRepository } from '../../persistence/repositories/routineRepository'
import { generateId } from '../../utils/id'

export interface RoutinesApi {
  routines: Routine[]
  loading: boolean
  createRoutine: (name: string, exercises: RoutineExercise[]) => Promise<Routine>
}

/** Loads saved routines and exposes a way to add to them. UI state only. */
export function useRoutines(): RoutinesApi {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setRoutines(await routineRepository.getAll())
    setLoading(false)
  }, [])

  // Loading from IndexedDB on mount; reload's state updates happen after
  // its `await`, not synchronously (see useExercises for the longer version).
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- see above
    reload()
  }, [reload])

  const createRoutine = useCallback(
    async (name: string, exercises: RoutineExercise[]) => {
      const routine: Routine = { id: generateId(), name, exercises }
      await routineRepository.add(routine)
      await reload()
      return routine
    },
    [reload],
  )

  return { routines, loading, createRoutine }
}
