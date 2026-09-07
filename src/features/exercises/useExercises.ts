import { useCallback, useEffect, useState } from 'react'
import type { Exercise } from '../../domain/exercise/exercise'
import { exerciseRepository } from '../../persistence/repositories/exerciseRepository'
import { generateId } from '../../utils/id'

export interface ExercisesApi {
  exercises: Exercise[]
  loading: boolean
  createExercise: (input: Omit<Exercise, 'id'>) => Promise<Exercise>
}

/**
 * Loads the exercise catalog and exposes a way to add to it. UI state
 * only — the shape of an Exercise and how it's persisted are decided by
 * domain/persistence, not here.
 *
 * Call this once (in App) and pass the result down as props to whichever
 * features need it (workout logging, routines) — two independent calls
 * would each hold their own copy of the catalog and could drift out of
 * sync within the same session (e.g. an exercise created from one
 * feature not showing up in the other's picker).
 */
export function useExercises(): ExercisesApi {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  // No setLoading(true) here: the initial state is already `true`, and a
  // reload triggered after createExercise doesn't need to re-show the
  // loading state (the picker is showing the create form at that point).
  const reload = useCallback(async () => {
    setExercises(await exerciseRepository.getAll())
    setLoading(false)
  }, [])

  // Loading the catalog from IndexedDB on mount is synchronizing with an
  // external system, and reload's state updates happen after its
  // `await` — not synchronously — so this isn't the cascading-render
  // pattern the rule is guarding against.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- see above
    reload()
  }, [reload])

  const createExercise = useCallback(async (input: Omit<Exercise, 'id'>) => {
    const exercise: Exercise = { ...input, id: generateId() }
    await exerciseRepository.add(exercise)
    await reload()
    return exercise
  }, [reload])

  return { exercises, loading, createExercise }
}
