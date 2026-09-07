import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { closeDatabase } from '../persistence/indexedDb/openDatabase'
import { DATABASE_NAME } from '../persistence/indexedDb/schema'
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
  it('renders the app shell defaulting to the home tab', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Forta' })).toBeInTheDocument()
    expect(await screen.findByText('Todavía no registraste un entrenamiento')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Registrar entrenamiento' })).not.toBeInTheDocument()
  })

  it('navigates to Entrenar, defaulting to the Registrar view', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Entrenar' }))

    expect(screen.getByRole('region', { name: 'Registrar entrenamiento' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Registrar' })).toHaveAttribute('aria-selected', 'true')
  })

  it('creates a routine, starts a workout from it, saves, and finds it everywhere it should', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Entrenar' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Rutinas' }))
    const routinesSection = screen.getByRole('region', { name: 'Rutinas' })

    // Create the exercise from the routine builder's picker, once the
    // (async, real-IndexedDB) catalog load has settled.
    await within(routinesSection).findByText('No hay ejercicios todavía.')
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Crear ejercicio' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Squat' } })
    const primarySelect = screen.getByLabelText('Músculos primarios') as HTMLSelectElement
    ;(within(primarySelect).getByRole('option', { name: 'QUADRICEPS' }) as HTMLOptionElement).selected = true
    fireEvent.change(primarySelect)
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Crear ejercicio' }))

    // Creating the exercise is async (real IndexedDB writes) — wait for
    // it to actually land in the routine's draft exercise list before
    // continuing, otherwise "Guardar rutina" would still be disabled.
    await within(routinesSection).findByRole('button', { name: 'Quitar' })

    fireEvent.change(screen.getByLabelText('Nombre de la rutina'), { target: { value: 'Leg Day' } })
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Guardar rutina' }))
    expect(await within(routinesSection).findByText('Leg Day', { exact: false })).toBeInTheDocument()

    // Starting a routine switches the Entrenar tab back to Registrar automatically.
    fireEvent.click(within(routinesSection).getByRole('button', { name: 'Usar esta rutina' }))
    const workoutSection = await screen.findByRole('region', { name: 'Registrar entrenamiento' })
    expect(within(workoutSection).getByRole('heading', { name: 'Squat' })).toBeInTheDocument()

    fireEvent.click(within(workoutSection).getByRole('button', { name: '+ Serie' }))
    fireEvent.change(within(workoutSection).getByLabelText('Peso (kg)'), { target: { value: '100' } })
    fireEvent.change(within(workoutSection).getByLabelText('Reps'), { target: { value: '5' } })
    fireEvent.click(within(workoutSection).getByRole('button', { name: 'Guardar entrenamiento' }))
    expect(await within(workoutSection).findByRole('status')).toHaveTextContent('Entrenamiento guardado.')

    // Shows up on the home dashboard as today's completed workout.
    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }))
    const todayCard = await screen.findByRole('region', { name: 'Entrenamiento de hoy' })
    expect(within(todayCard).getByText('Completado', { exact: false })).toBeInTheDocument()
    expect(within(todayCard).getByRole('heading', { name: 'Squat' })).toBeInTheDocument()

    // The saved workout shows up in history, with its exercise and set.
    fireEvent.click(screen.getByRole('button', { name: 'Historial' }))
    const historySection = screen.getByRole('region', { name: 'Historial' })
    expect(await within(historySection).findByText('Squat', { exact: false })).toBeInTheDocument()

    fireEvent.click(within(historySection).getByRole('button', { name: 'Ver detalle' }))
    const detail = within(historySection).getByRole('region', { name: 'Detalle del entrenamiento' })
    expect(within(detail).getByText(/100 kg × 5 reps/)).toBeInTheDocument()

    // The saved workout shows up in the progress dashboard: general
    // (session count and volume shown together, not merged), per
    // exercise (a performance point), and per muscle (a direct set).
    // The current (last, since ranges run oldest-to-newest) week's row
    // is where this workout's data lands.
    fireEvent.click(screen.getByRole('button', { name: 'Progreso' }))
    const progressSection = screen.getByRole('region', { name: 'Progreso' })

    const generalView = await within(progressSection).findByRole('region', { name: 'Progreso general' })
    const generalRows = within(generalView).getAllByRole('row')
    const generalCells = within(generalRows[generalRows.length - 1]).getAllByRole('cell')
    expect(generalCells[1]).toHaveTextContent('1') // sessionCount
    expect(generalCells[2]).toHaveTextContent('500') // totalVolume (100kg x 5)

    const exerciseView = within(progressSection).getByRole('region', { name: 'Progreso por ejercicio' })
    const exerciseSelect = within(exerciseView).getByLabelText('Ejercicio') as HTMLSelectElement
    const squatOption = within(exerciseSelect).getByRole('option', { name: 'Squat' }) as HTMLOptionElement
    fireEvent.change(exerciseSelect, { target: { value: squatOption.value } })
    expect(await within(exerciseView).findByText(/1RM estimado/)).toBeInTheDocument()

    const muscleView = within(progressSection).getByRole('region', { name: 'Progreso por músculo' })
    const muscleSelect = within(muscleView).getByLabelText('Músculo') as HTMLSelectElement
    fireEvent.change(muscleSelect, { target: { value: 'QUADRICEPS' } })
    const muscleRows = await within(muscleView).findAllByRole('row')
    const muscleCells = within(muscleRows[muscleRows.length - 1]).getAllByRole('cell')
    expect(muscleCells[1]).toHaveTextContent('1') // directSets
    expect(muscleCells[2]).toHaveTextContent('0') // indirectSets
    expect(muscleCells[3]).toHaveTextContent('1') // sessions
  })

  it('logs body weight from Ajustes and reflects it on the home dashboard', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    const weightSection = screen.getByRole('region', { name: 'Peso corporal' })

    await within(weightSection).findByText('Todavía no registraste tu peso.')
    fireEvent.change(within(weightSection).getByLabelText('Peso (kg)'), { target: { value: '82.5' } })
    fireEvent.click(within(weightSection).getByRole('button', { name: 'Guardar' }))

    expect(await within(weightSection).findByText('82.5')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }))
    const bodyWeightCard = await screen.findByRole('region', { name: 'Peso corporal' })
    expect(await within(bodyWeightCard).findByText('82.5')).toBeInTheDocument()
  })
})
