import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useExercises } from '../exercises/useExercises'
import { closeDatabase } from '../../persistence/indexedDb/openDatabase'
import { DATABASE_NAME } from '../../persistence/indexedDb/schema'
import { workoutRepository } from '../../persistence/repositories/workoutRepository'
import { LogWorkoutForm } from './LogWorkoutForm'
import { useWorkoutForm } from './useWorkoutForm'

// LogWorkoutForm is presentational (props-driven, shared with the
// routines feature at the App level) — this harness wires up the real
// hooks so the test still exercises real IndexedDB reads/writes.
function Harness() {
  const exercisesApi = useExercises()
  const form = useWorkoutForm()
  return <LogWorkoutForm form={form} exercisesApi={exercisesApi} />
}

afterEach(async () => {
  await closeDatabase()
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
  })
})

describe('LogWorkoutForm', () => {
  it('creates an exercise inline, logs a set, and saves the workout', async () => {
    render(<Harness />)

    await screen.findByText('No hay ejercicios todavía.')
    fireEvent.click(screen.getByRole('button', { name: 'Crear ejercicio' }))

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Bench Press' } })

    const primarySelect = screen.getByLabelText('Músculos primarios') as HTMLSelectElement
    ;(within(primarySelect).getByRole('option', { name: 'CHEST' }) as HTMLOptionElement).selected = true
    fireEvent.change(primarySelect)

    fireEvent.click(screen.getByRole('button', { name: 'Crear ejercicio' }))

    expect(await screen.findByRole('heading', { name: 'Bench Press' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+ Serie' }))

    const setGroup = screen.getByRole('group', { name: 'Serie 1' })
    fireEvent.change(within(setGroup).getByLabelText('Peso (kg)'), { target: { value: '80' } })
    fireEvent.change(within(setGroup).getByLabelText('Reps'), { target: { value: '8' } })

    fireEvent.click(screen.getByRole('button', { name: 'Guardar entrenamiento' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Entrenamiento guardado.')

    const [workout] = await workoutRepository.getAll()
    expect(workout.exercises).toHaveLength(1)
    expect(workout.exercises[0].sets).toEqual([
      expect.objectContaining({ weight: 80, reps: 8, type: 'WORKING', completed: true }),
    ])
  })

  it('keeps the save button disabled until at least one exercise is added', async () => {
    render(<Harness />)

    expect(screen.getByRole('button', { name: 'Guardar entrenamiento' })).toBeDisabled()
  })

  it('logs a TIME-tracked exercise by duration, not weight/reps (regression: D-022)', async () => {
    render(<Harness />)

    await screen.findByText('No hay ejercicios todavía.')
    fireEvent.click(screen.getByRole('button', { name: 'Crear ejercicio' }))

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Plank' } })
    const primarySelect = screen.getByLabelText('Músculos primarios') as HTMLSelectElement
    ;(within(primarySelect).getByRole('option', { name: 'ABS' }) as HTMLOptionElement).selected = true
    fireEvent.change(primarySelect)
    fireEvent.change(screen.getByLabelText('Tipo de registro'), { target: { value: 'TIME' } })

    fireEvent.click(screen.getByRole('button', { name: 'Crear ejercicio' }))
    expect(await screen.findByRole('heading', { name: 'Plank' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+ Serie' }))
    const setGroup = screen.getByRole('group', { name: 'Serie 1' })

    expect(within(setGroup).queryByLabelText('Peso (kg)')).not.toBeInTheDocument()
    expect(within(setGroup).queryByLabelText('Reps')).not.toBeInTheDocument()
    fireEvent.change(within(setGroup).getByLabelText('Duración (seg)'), { target: { value: '45' } })

    fireEvent.click(screen.getByRole('button', { name: 'Guardar entrenamiento' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Entrenamiento guardado.')

    const [workout] = await workoutRepository.getAll()
    expect(workout.exercises[0].sets).toEqual([expect.objectContaining({ durationSeconds: 45 })])
  })
})
