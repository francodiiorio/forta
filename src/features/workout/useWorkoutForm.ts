import { useState } from 'react'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Routine } from '../../domain/routine/routine'
import type { Set as WorkoutSet } from '../../domain/workout/set'
import type { Workout, WorkoutExercise } from '../../domain/workout/workout'
import { workoutRepository } from '../../persistence/repositories/workoutRepository'
import type { Id } from '../../types/common'
import { dateInputToISODateTime, isoDateTimeToDateInput } from '../../utils/date'
import { generateId } from '../../utils/id'

interface DraftWorkoutExercise {
  exercise: Exercise
  workoutExercise: WorkoutExercise
}

function todayDateInput(): string {
  return isoDateTimeToDateInput(new Date().toISOString())
}

/**
 * Local UI state for the "log a workout" flow. Building a Workout/Set
 * here from form input is shape-mapping, not a fitness rule — the actual
 * domain types and constraints come from src/domain.
 */
export type WorkoutFormApi = ReturnType<typeof useWorkoutForm>

export function useWorkoutForm() {
  const [date, setDate] = useState(todayDateInput)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftWorkoutExercise[]>([])
  const [routineId, setRoutineId] = useState<Id | undefined>(undefined)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)

  function addExercise(exercise: Exercise) {
    setItems((prev) => [
      ...prev,
      { exercise, workoutExercise: { id: generateId(), exerciseId: exercise.id, sets: [] } },
    ])
  }

  /**
   * Starts the draft from a routine: one empty (no sets yet) entry per
   * routine exercise, in order. Any routine exercise whose Exercise no
   * longer exists in the catalog is skipped rather than crashing the
   * form — there's no exercise-deletion flow yet, but nothing prevents
   * one from existing by the time this runs.
   */
  function startFromRoutine(routine: Routine, catalog: Exercise[]) {
    const exerciseById = new Map(catalog.map((exercise) => [exercise.id, exercise]))

    const newItems = routine.exercises.reduce<DraftWorkoutExercise[]>((acc, routineExercise) => {
      const exercise = exerciseById.get(routineExercise.exerciseId)
      if (exercise) {
        acc.push({ exercise, workoutExercise: { id: generateId(), exerciseId: exercise.id, sets: [] } })
      }
      return acc
    }, [])

    setItems(newItems)
    setRoutineId(routine.id)
  }

  function removeExercise(workoutExerciseId: Id) {
    setItems((prev) => prev.filter((item) => item.workoutExercise.id !== workoutExerciseId))
  }

  function addSet(workoutExerciseId: Id) {
    const newSet: WorkoutSet = { id: generateId(), type: 'WORKING', completed: true }
    setItems((prev) =>
      prev.map((item) =>
        item.workoutExercise.id === workoutExerciseId
          ? { ...item, workoutExercise: { ...item.workoutExercise, sets: [...item.workoutExercise.sets, newSet] } }
          : item,
      ),
    )
  }

  function updateSet(workoutExerciseId: Id, setId: Id, changes: Partial<WorkoutSet>) {
    setItems((prev) =>
      prev.map((item) =>
        item.workoutExercise.id === workoutExerciseId
          ? {
              ...item,
              workoutExercise: {
                ...item.workoutExercise,
                sets: item.workoutExercise.sets.map((set) => (set.id === setId ? { ...set, ...changes } : set)),
              },
            }
          : item,
      ),
    )
  }

  function removeSet(workoutExerciseId: Id, setId: Id) {
    setItems((prev) =>
      prev.map((item) =>
        item.workoutExercise.id === workoutExerciseId
          ? {
              ...item,
              workoutExercise: {
                ...item.workoutExercise,
                sets: item.workoutExercise.sets.filter((set) => set.id !== setId),
              },
            }
          : item,
      ),
    )
  }

  const canSave = items.length > 0 && !saving

  async function save(): Promise<Workout | undefined> {
    // Guards against a double-click firing two saves before the first
    // one has re-rendered the (disabled) button.
    if (!canSave) return undefined

    setSaving(true)
    try {
      const timestamp = dateInputToISODateTime(date)
      const workout: Workout = {
        id: generateId(),
        startedAt: timestamp,
        completedAt: timestamp,
        exercises: items.map((item) => item.workoutExercise),
        ...(routineId ? { routineId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }

      await workoutRepository.add(workout)

      setItems([])
      setRoutineId(undefined)
      setNotes('')
      setDate(todayDateInput())
      setLastSavedAt(new Date())

      return workout
    } finally {
      setSaving(false)
    }
  }

  return {
    date,
    setDate,
    notes,
    setNotes,
    items,
    routineId,
    addExercise,
    startFromRoutine,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    canSave,
    save,
    lastSavedAt,
  }
}
