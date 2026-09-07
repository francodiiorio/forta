import { useState } from 'react'
import type { Exercise } from '../../domain/exercise/exercise'
import { ExerciseForm } from './ExerciseForm'
import { useExercises } from './useExercises'

interface ExercisePickerProps {
  onPick: (exercise: Exercise) => void
}

/** Pick an exercise from the catalog, or create one inline if it doesn't exist yet. */
export function ExercisePicker({ onPick }: ExercisePickerProps) {
  const { exercises, loading, createExercise } = useExercises()
  const [creating, setCreating] = useState(false)

  if (creating) {
    return (
      <ExerciseForm
        onCancel={() => setCreating(false)}
        onCreate={async (input) => {
          const exercise = await createExercise(input)
          setCreating(false)
          onPick(exercise)
        }}
      />
    )
  }

  if (loading) {
    return <p>Cargando ejercicios…</p>
  }

  if (exercises.length === 0) {
    return (
      <div>
        <p>No hay ejercicios todavía.</p>
        <button type="button" onClick={() => setCreating(true)}>
          Crear ejercicio
        </button>
      </div>
    )
  }

  return (
    <div>
      <select
        aria-label="Elegir ejercicio"
        defaultValue=""
        onChange={(event) => {
          const exercise = exercises.find((candidate) => candidate.id === event.target.value)
          if (exercise) onPick(exercise)
          event.target.value = ''
        }}
      >
        <option value="" disabled>
          Elegir ejercicio…
        </option>
        {exercises.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => setCreating(true)}>
        + Nuevo ejercicio
      </button>
    </div>
  )
}
