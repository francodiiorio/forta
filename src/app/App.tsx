import { useState } from 'react'
import { useExercises } from '../features/exercises/useExercises'
import { HistorySection } from '../features/history/HistorySection'
import { RoutinesSection } from '../features/routines/RoutinesSection'
import { LogWorkoutForm } from '../features/workout/LogWorkoutForm'
import { useWorkoutForm } from '../features/workout/useWorkoutForm'

const TABS = [
  { key: 'workout', label: 'Registrar' },
  { key: 'routines', label: 'Rutinas' },
  { key: 'history', label: 'Historial' },
] as const

type Tab = (typeof TABS)[number]['key']

export function App() {
  const [tab, setTab] = useState<Tab>('workout')

  // Shared once here so the workout and routines features never hold two
  // independent (and independently stale) copies of the exercise catalog.
  const exercisesApi = useExercises()
  const workoutForm = useWorkoutForm()

  return (
    <main>
      <h1>Forta</h1>

      <nav aria-label="Secciones">
        {TABS.map(({ key, label }) => (
          <button key={key} type="button" aria-current={tab === key} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'workout' && <LogWorkoutForm form={workoutForm} exercisesApi={exercisesApi} />}

      {tab === 'routines' && (
        <RoutinesSection
          exercisesApi={exercisesApi}
          onStartRoutine={(routine, catalog) => {
            workoutForm.startFromRoutine(routine, catalog)
            setTab('workout')
          }}
        />
      )}

      {tab === 'history' && <HistorySection exercisesApi={exercisesApi} />}
    </main>
  )
}
