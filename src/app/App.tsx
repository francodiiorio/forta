import { useState } from 'react'
import { ClockIcon, DumbbellIcon, GearIcon, HomeIcon, TrendIcon, UserIcon } from '../components/icons'
import { useExercises } from '../features/exercises/useExercises'
import { HistorySection } from '../features/history/HistorySection'
import { HomeSection } from '../features/home/HomeSection'
import { ProfileSection } from '../features/profile/ProfileSection'
import { ProgressSection } from '../features/progress/ProgressSection'
import { SettingsSection } from '../features/settings/SettingsSection'
import { TrainSection } from '../features/workout/TrainSection'
import { useWorkoutForm } from '../features/workout/useWorkoutForm'

const TABS = [
  { key: 'home', label: 'Inicio', Icon: HomeIcon },
  { key: 'train', label: 'Entrenar', Icon: DumbbellIcon },
  { key: 'history', label: 'Historial', Icon: ClockIcon },
  { key: 'progress', label: 'Progreso', Icon: TrendIcon },
  { key: 'profile', label: 'Perfil', Icon: UserIcon },
  { key: 'settings', label: 'Ajustes', Icon: GearIcon },
] as const

type Tab = (typeof TABS)[number]['key']

export function App() {
  const [tab, setTab] = useState<Tab>('home')

  // Shared once here so features never hold independent (and
  // independently stale) copies of the exercise catalog or the
  // in-progress workout draft — see D-018, D-021.
  const exercisesApi = useExercises()
  const workoutForm = useWorkoutForm()

  return (
    <div className="app">
      <main className="app-content">
        {tab === 'home' && <HomeSection exercisesApi={exercisesApi} onGoToWorkout={() => setTab('train')} />}

        {tab === 'train' && (
          <TrainSection form={workoutForm} exercisesApi={exercisesApi} onStartRoutine={workoutForm.startFromRoutine} />
        )}

        {tab === 'history' && <HistorySection exercisesApi={exercisesApi} />}

        {tab === 'progress' && <ProgressSection exercisesApi={exercisesApi} />}

        {tab === 'profile' && <ProfileSection />}

        {tab === 'settings' && <SettingsSection />}
      </main>

      <nav className="bottom-nav" aria-label="Secciones">
        <span className="sidebar-brand" aria-hidden="true">
          Forta
        </span>
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className="bottom-nav-button"
            aria-current={tab === key}
            onClick={() => setTab(key)}
          >
            <Icon className="bottom-nav-icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
