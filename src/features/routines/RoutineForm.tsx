import { useState } from 'react'
import type { Exercise } from '../../domain/exercise/exercise'
import type { RoutineExercise } from '../../domain/routine/routine'
import { ExercisePicker } from '../exercises/ExercisePicker'
import type { ExercisesApi } from '../exercises/useExercises'
import { generateId } from '../../utils/id'

interface DraftEntry {
  exercise: Exercise
  routineExercise: RoutineExercise
}

interface RoutineFormProps {
  exercisesApi: ExercisesApi
  onCreate: (name: string, exercises: RoutineExercise[]) => void
}

/**
 * Create a routine: a name plus an ordered list of exercises (no target
 * sets/reps — see D-010).
 *
 * Not a `<form>` itself: it embeds ExercisePicker, which can render
 * ExerciseForm (a `<form>`) when creating an exercise inline, and nested
 * `<form>` elements are invalid HTML that silently breaks submission.
 */
export function RoutineForm({ exercisesApi, onCreate }: RoutineFormProps) {
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<DraftEntry[]>([])

  const canSubmit = name.trim().length > 0 && entries.length > 0

  function addExercise(exercise: Exercise) {
    setEntries((prev) => [...prev, { exercise, routineExercise: { id: generateId(), exerciseId: exercise.id } }])
  }

  function removeExercise(routineExerciseId: string) {
    setEntries((prev) => prev.filter((entry) => entry.routineExercise.id !== routineExerciseId))
  }

  function handleCreate() {
    if (!canSubmit) return

    onCreate(
      name.trim(),
      entries.map((entry) => entry.routineExercise),
    )
    setName('')
    setEntries([])
  }

  return (
    <div className="exercise-card" aria-label="Nueva rutina">
      <label className="field">
        Nombre de la rutina
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      {entries.length > 0 && (
        <ul>
          {entries.map(({ exercise, routineExercise }) => (
            <li key={routineExercise.id}>
              {exercise.name}{' '}
              <button type="button" onClick={() => removeExercise(routineExercise.id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <ExercisePicker exercisesApi={exercisesApi} onPick={addExercise} />

      <div className="button-group">
        <button type="button" className="button-primary" disabled={!canSubmit} onClick={handleCreate}>
          Guardar rutina
        </button>
      </div>
    </div>
  )
}
