import { useState } from 'react'
import { EQUIPMENT, EXERCISE_CATEGORIES, LATERALITIES, type Exercise } from '../../domain/exercise/exercise'
import { TRACKING_TYPES } from '../../domain/exercise/trackingType'
import { MUSCLES, type Muscle } from '../../domain/muscle/muscle'

interface ExerciseFormProps {
  onCreate: (input: Omit<Exercise, 'id'>) => void
  onCancel: () => void
}

function readSelectedMuscles(select: HTMLSelectElement): Muscle[] {
  return Array.from(select.selectedOptions, (option) => option.value as Muscle)
}

/** Minimal exercise catalog entry form — collects every required Exercise field. */
export function ExerciseForm({ onCreate, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState('')
  const [primaryMuscles, setPrimaryMuscles] = useState<Muscle[]>([])
  const [secondaryMuscles, setSecondaryMuscles] = useState<Muscle[]>([])
  const [equipment, setEquipment] = useState<Exercise['equipment']>('BARBELL')
  const [trackingType, setTrackingType] = useState<Exercise['trackingType']>('WEIGHT_REPS')
  const [laterality, setLaterality] = useState<Exercise['laterality']>('BILATERAL')
  const [category, setCategory] = useState<Exercise['category']>('COMPOUND')

  const canSubmit = name.trim().length > 0 && primaryMuscles.length > 0

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    onCreate({ name: name.trim(), primaryMuscles, secondaryMuscles, equipment, trackingType, laterality, category })
  }

  return (
    <form className="exercise-card" onSubmit={handleSubmit} aria-label="Nuevo ejercicio">
      <label className="field">
        Nombre
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="field">
        Músculos primarios
        <select
          multiple
          value={primaryMuscles}
          onChange={(event) => setPrimaryMuscles(readSelectedMuscles(event.target))}
        >
          {MUSCLES.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscle}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Músculos secundarios
        <select
          multiple
          value={secondaryMuscles}
          onChange={(event) => setSecondaryMuscles(readSelectedMuscles(event.target))}
        >
          {MUSCLES.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscle}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Equipamiento
        <select value={equipment} onChange={(event) => setEquipment(event.target.value as Exercise['equipment'])}>
          {EQUIPMENT.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Tipo de registro
        <select
          value={trackingType}
          onChange={(event) => setTrackingType(event.target.value as Exercise['trackingType'])}
        >
          {TRACKING_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Lateralidad
        <select value={laterality} onChange={(event) => setLaterality(event.target.value as Exercise['laterality'])}>
          {LATERALITIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Categoría
        <select value={category} onChange={(event) => setCategory(event.target.value as Exercise['category'])}>
          {EXERCISE_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <div className="button-group">
        <button type="submit" className="button-primary" disabled={!canSubmit}>
          Crear ejercicio
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
