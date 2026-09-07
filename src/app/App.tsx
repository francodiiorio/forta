import { useState } from 'react'
import { useExercises } from '../features/exercises/useExercises'
import { HistorySection } from '../features/history/HistorySection'
import { ProgressSection } from '../features/progress/ProgressSection'
import { RoutinesSection } from '../features/routines/RoutinesSection'
import { LogWorkoutForm } from '../features/workout/LogWorkoutForm'
import { useWorkoutForm } from '../features/workout/useWorkoutForm'

const TABS = [
  { key: 'workout', label: 'Registrar' },
  { key: 'routines', label: 'Rutinas' },
  { key: 'history', label: 'Historial' },
  { key: 'progress', label: 'Progreso' },
] as const

type Tab = (typeof TABS)[number]['key']

export function App() {
  const [tab, setTab] = useState<Tab>('workout')

  // Shared once here so the workout and routines features never hold two
  // independent (and independently stale) copies of the exercise catalog.
  const exercisesApi = useExercises()
  const workoutForm = useWorkoutForm()

  return (
    <main className="app">
      <h1 className="app-title">Forta</h1>

      <nav className="tab-bar" aria-label="Secciones">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className="tab-button"
            aria-current={tab === key}
            onClick={() => setTab(key)}
          >
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

      {tab === 'progress' && <ProgressSection exercisesApi={exercisesApi} />}
    </main>
  )
}
