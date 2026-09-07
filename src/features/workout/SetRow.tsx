import type { Exercise } from '../../domain/exercise/exercise'
import { requiresReps, requiresWeight } from '../../domain/exercise/trackingType'
import { SET_TYPES, type Set as WorkoutSet } from '../../domain/workout/set'

interface SetRowProps {
  set: WorkoutSet
  trackingType: Exercise['trackingType']
  index: number
  onChange: (changes: Partial<WorkoutSet>) => void
  onRemove: () => void
}

function toOptionalNumber(value: string): number | undefined {
  return value === '' ? undefined : Number(value)
}

/** One set's fields. Which fields are shown depends on the exercise's trackingType — a domain rule, not a UI guess. */
export function SetRow({ set, trackingType, index, onChange, onRemove }: SetRowProps) {
  return (
    <div role="group" aria-label={`Serie ${index + 1}`}>
      <span>{index + 1}</span>

      {requiresWeight(trackingType) && (
        <label>
          Peso (kg)
          <input
            type="number"
            value={set.weight ?? ''}
            onChange={(event) => onChange({ weight: toOptionalNumber(event.target.value) })}
          />
        </label>
      )}

      {requiresReps(trackingType) && (
        <label>
          Reps
          <input
            type="number"
            value={set.reps ?? ''}
            onChange={(event) => onChange({ reps: toOptionalNumber(event.target.value) })}
          />
        </label>
      )}

      <label>
        RIR
        <input
          type="number"
          value={set.rir ?? ''}
          onChange={(event) => onChange({ rir: toOptionalNumber(event.target.value) })}
        />
      </label>

      <label>
        RPE
        <input
          type="number"
          value={set.rpe ?? ''}
          onChange={(event) => onChange({ rpe: toOptionalNumber(event.target.value) })}
        />
      </label>

      <label>
        Tipo
        <select value={set.type} onChange={(event) => onChange({ type: event.target.value as WorkoutSet['type'] })}>
          {SET_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label>
        Completada
        <input
          type="checkbox"
          checked={set.completed}
          onChange={(event) => onChange({ completed: event.target.checked })}
        />
      </label>

      <button type="button" onClick={onRemove}>
        Quitar serie
      </button>
    </div>
  )
}
