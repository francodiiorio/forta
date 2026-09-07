import { useState } from 'react'
import type { Exercise } from '../../domain/exercise/exercise'
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
export function useWorkoutForm() {
  const [date, setDate] = useState(todayDateInput)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftWorkoutExercise[]>([])
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)

  function addExercise(exercise: Exercise) {
    setItems((prev) => [
      ...prev,
      { exercise, workoutExercise: { id: generateId(), exerciseId: exercise.id, sets: [] } },
    ])
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
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }

      await workoutRepository.add(workout)

      setItems([])
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
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    canSave,
    save,
    lastSavedAt,
  }
}
