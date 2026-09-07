import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { closeDatabase } from '../../persistence/indexedDb/openDatabase'
import { DATABASE_NAME } from '../../persistence/indexedDb/schema'
import { workoutRepository } from '../../persistence/repositories/workoutRepository'
import { LogWorkoutForm } from './LogWorkoutForm'

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
    render(<LogWorkoutForm />)

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
    render(<LogWorkoutForm />)

    expect(screen.getByRole('button', { name: 'Guardar entrenamiento' })).toBeDisabled()
  })
})
