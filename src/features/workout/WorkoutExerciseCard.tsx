import type { Exercise } from '../../domain/exercise/exercise'
import type { Set as WorkoutSet } from '../../domain/workout/set'
import type { WorkoutExercise } from '../../domain/workout/workout'
import type { Id } from '../../types/common'
import { SetRow } from './SetRow'

interface WorkoutExerciseCardProps {
  exercise: Exercise
  workoutExercise: WorkoutExercise
  onAddSet: () => void
  onUpdateSet: (setId: Id, changes: Partial<WorkoutSet>) => void
  onRemoveSet: (setId: Id) => void
  onRemoveExercise: () => void
}

export function WorkoutExerciseCard({
  exercise,
  workoutExercise,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onRemoveExercise,
}: WorkoutExerciseCardProps) {
  return (
    <section aria-label={exercise.name}>
      <header>
        <h3>{exercise.name}</h3>
        <button type="button" onClick={onRemoveExercise}>
          Quitar ejercicio
        </button>
      </header>

      {workoutExercise.sets.map((set, index) => (
        <SetRow
          key={set.id}
          set={set}
          index={index}
          trackingType={exercise.trackingType}
          onChange={(changes) => onUpdateSet(set.id, changes)}
          onRemove={() => onRemoveSet(set.id)}
        />
      ))}

      <button type="button" onClick={onAddSet}>
        + Serie
      </button>
    </section>
  )
}
