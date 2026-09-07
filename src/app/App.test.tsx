import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { closeDatabase } from '../persistence/indexedDb/openDatabase'
import { DATABASE_NAME } from '../persistence/indexedDb/schema'
import { workoutRepository } from '../persistence/repositories/workoutRepository'
import { App } from './App'

afterEach(async () => {
  await closeDatabase()
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
  })
})

describe('App', () => {
  it('renders the app shell with the routines and workout logging sections', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Forta' })).toBeInTheDocument()

    const workoutSection = screen.getByRole('region', { name: 'Registrar entrenamiento' })
    expect(await within(workoutSection).findByText('No hay ejercicios todavía.')).toBeInTheDocument()

    const routinesSection = screen.getByRole('region', { name: 'Rutinas' })
    expect(within(routinesSection).getByText('No hay rutinas todavía.')).toBeInTheDocument()
  })

  it('creates a routine, starts a workout from it, and saves with the routine linked', async () => {
    render(<App />)

    const workoutSection = screen.getByRole('region', { name: 'Registrar entrenamiento' })
    const routinesSection = screen.getByRole('region', { name: 'Rutinas' })

    // Create the exercise from the routine builder's picker.
    await within(workoutSection).findByText('No hay ejercicios todavía.')
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Crear ejercicio' }))

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Squat' } })
    const primarySelect = screen.getByLabelText('Músculos primarios') as HTMLSelectElement
    ;(within(primarySelect).getByRole('option', { name: 'QUADRICEPS' }) as HTMLOptionElement).selected = true
    fireEvent.change(primarySelect)
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Crear ejercicio' }))

    // Creating the exercise is async (real IndexedDB writes) — wait for
    // it to actually land in the routine's draft exercise list (the
    // "Quitar" button only renders there) before continuing, otherwise
    // "Guardar rutina" would still be disabled. "Squat" itself is
    // ambiguous here: it also appears as a <option> in the picker.
    await within(routinesSection).findByRole('button', { name: 'Quitar' })

    // Build and save the routine.
    fireEvent.change(screen.getByLabelText('Nombre de la rutina'), { target: { value: 'Leg Day' } })
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Guardar rutina' }))

    expect(await within(routinesSection).findByText('Leg Day')).toBeInTheDocument()

    // Start a workout from the routine — the exercise appears pre-added, with no sets yet.
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Usar esta rutina' }))

    expect(await within(workoutSection).findByRole('heading', { name: 'Squat' })).toBeInTheDocument()

    fireEvent.click(within(workoutSection).getByRole('button', { name: '+ Serie' }))
    fireEvent.change(within(workoutSection).getByLabelText('Peso (kg)'), { target: { value: '100' } })
    fireEvent.change(within(workoutSection).getByLabelText('Reps'), { target: { value: '5' } })

    fireEvent.click(within(workoutSection).getByRole('button', { name: 'Guardar entrenamiento' }))
    expect(await within(workoutSection).findByRole('status')).toHaveTextContent('Entrenamiento guardado.')

    const [workout] = await workoutRepository.getAll()
    expect(workout.routineId).toBeDefined()
    expect(workout.exercises).toHaveLength(1)
    expect(workout.exercises[0].sets).toEqual([
      expect.objectContaining({ weight: 100, reps: 5, type: 'WORKING', completed: true }),
    ])
  })
})
