import type { ExercisesApi } from '../exercises/useExercises'
import { ExercisePicker } from '../exercises/ExercisePicker'
import type { WorkoutFormApi } from './useWorkoutForm'
import { WorkoutExerciseCard } from './WorkoutExerciseCard'

interface LogWorkoutFormProps {
  form: WorkoutFormApi
  exercisesApi: ExercisesApi
}

/** Log a completed workout: date, exercises, sets, weight/reps, save. */
export function LogWorkoutForm({ form, exercisesApi }: LogWorkoutFormProps) {
  const {
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
  } = form

  return (
    <section aria-label="Registrar entrenamiento">
      <h2>Registrar entrenamiento</h2>

      <label>
        Fecha
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      {items.map(({ exercise, workoutExercise }) => (
        <WorkoutExerciseCard
          key={workoutExercise.id}
          exercise={exercise}
          workoutExercise={workoutExercise}
          onAddSet={() => addSet(workoutExercise.id)}
          onUpdateSet={(setId, changes) => updateSet(workoutExercise.id, setId, changes)}
          onRemoveSet={(setId) => removeSet(workoutExercise.id, setId)}
          onRemoveExercise={() => removeExercise(workoutExercise.id)}
        />
      ))}

      <ExercisePicker exercisesApi={exercisesApi} onPick={addExercise} />

      <label>
        Notas
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <button type="button" disabled={!canSave} onClick={() => save()}>
        Guardar entrenamiento
      </button>

      {lastSavedAt && <p role="status">Entrenamiento guardado.</p>}
    </section>
  )
}
