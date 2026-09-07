import { useExercises } from '../features/exercises/useExercises'
import { RoutinesSection } from '../features/routines/RoutinesSection'
import { LogWorkoutForm } from '../features/workout/LogWorkoutForm'
import { useWorkoutForm } from '../features/workout/useWorkoutForm'

export function App() {
  // Shared once here so the workout and routines features never hold two
  // independent (and independently stale) copies of the exercise catalog.
  const exercisesApi = useExercises()
  const workoutForm = useWorkoutForm()

  return (
    <main>
      <h1>Forta</h1>
      <RoutinesSection exercisesApi={exercisesApi} onStartRoutine={workoutForm.startFromRoutine} />
      <LogWorkoutForm form={workoutForm} exercisesApi={exercisesApi} />
    </main>
  )
}
