import { ExercisePicker } from '../exercises/ExercisePicker'
import { useWorkoutForm } from './useWorkoutForm'
import { WorkoutExerciseCard } from './WorkoutExerciseCard'

/** Log a completed workout: date, exercises, sets, weight/reps, save. */
export function LogWorkoutForm() {
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
  } = useWorkoutForm()

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

      <ExercisePicker onPick={addExercise} />

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
