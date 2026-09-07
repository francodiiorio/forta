import { useState } from 'react'
import type { Exercise } from '../../domain/exercise/exercise'
import type { Routine } from '../../domain/routine/routine'
import type { ExercisesApi } from '../exercises/useExercises'
import { RoutinesSection } from '../routines/RoutinesSection'
import { LogWorkoutForm } from './LogWorkoutForm'
import type { WorkoutFormApi } from './useWorkoutForm'

type View = 'log' | 'routines'

interface TrainSectionProps {
  form: WorkoutFormApi
  exercisesApi: ExercisesApi
  onStartRoutine: (routine: Routine, catalog: Exercise[]) => void
}

/** Registrar and Rutinas grouped under one tab, since they're two closely related ways to log training. */
export function TrainSection({ form, exercisesApi, onStartRoutine }: TrainSectionProps) {
  const [view, setView] = useState<View>('log')

  return (
    <div aria-label="Entrenar">
      <h1 className="page-title">Entrenar</h1>

      <div className="segmented-control" role="tablist" aria-label="Vista de entrenamiento">
        <button type="button" role="tab" aria-selected={view === 'log'} onClick={() => setView('log')}>
          Registrar
        </button>
        <button type="button" role="tab" aria-selected={view === 'routines'} onClick={() => setView('routines')}>
          Rutinas
        </button>
      </div>

      {view === 'log' && <LogWorkoutForm form={form} exercisesApi={exercisesApi} />}

      {view === 'routines' && (
        <RoutinesSection
          exercisesApi={exercisesApi}
          onStartRoutine={(routine, catalog) => {
            onStartRoutine(routine, catalog)
            setView('log')
          }}
        />
      )}
    </div>
  )
}
