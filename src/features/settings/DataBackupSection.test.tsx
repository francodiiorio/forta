import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { closeDatabase } from '../../persistence/indexedDb/openDatabase'
import { DATABASE_NAME } from '../../persistence/indexedDb/schema'
import { exerciseRepository } from '../../persistence/repositories/exerciseRepository'
import { DataBackupSection } from './DataBackupSection'

afterEach(async () => {
  await closeDatabase()
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
  })
})

function selectFile(input: HTMLElement, contents: string, name = 'backup.json') {
  const file = new File([contents], name, { type: 'application/json' })
  fireEvent.change(input, { target: { files: [file] } })
}

describe('DataBackupSection', () => {
  it('imports a valid backup after explicit confirmation, replacing existing data', async () => {
    await exerciseRepository.add({
      id: 'stale',
      name: 'Stale',
      primaryMuscles: ['CHEST'],
      secondaryMuscles: [],
      equipment: 'BARBELL',
      trackingType: 'WEIGHT_REPS',
      laterality: 'BILATERAL',
      category: 'COMPOUND',
    })

    render(<DataBackupSection />)

    const backup = {
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        exercises: [
          {
            id: 'ex-1',
            name: 'Deadlift',
            primaryMuscles: ['LOWER_BACK'],
            secondaryMuscles: [],
            equipment: 'BARBELL',
            trackingType: 'WEIGHT_REPS',
            laterality: 'BILATERAL',
            category: 'COMPOUND',
          },
        ],
        workouts: [],
        routines: [],
        bodyMeasurements: [],
      },
    }

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    selectFile(input, JSON.stringify(backup))

    expect(await screen.findByText(/reemplaza todos los datos/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar datos' }))

    expect(await screen.findByText(/Datos importados/)).toBeInTheDocument()

    const exercises = await exerciseRepository.getAll()
    expect(exercises).toEqual(backup.data.exercises)
  })

  it('shows a validation error for a malformed backup and leaves stored data untouched', async () => {
    render(<DataBackupSection />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    selectFile(input, JSON.stringify({ not: 'a backup' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Reemplazar datos' }))

    expect(await screen.findByText(/formatVersion/)).toBeInTheDocument()
  })

  it('shows an error for a file that is not valid JSON', async () => {
    render(<DataBackupSection />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    selectFile(input, 'not json at all')

    expect(await screen.findByText('El archivo no es un JSON válido.')).toBeInTheDocument()
  })

  it('lets the user cancel out of a pending import without applying it', async () => {
    render(<DataBackupSection />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    selectFile(
      input,
      JSON.stringify({
        formatVersion: 1,
        exportedAt: new Date().toISOString(),
        data: { exercises: [], workouts: [], routines: [], bodyMeasurements: [] },
      }),
    )

    await screen.findByText(/reemplaza todos los datos/)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByText(/reemplaza todos los datos/)).not.toBeInTheDocument()
  })
})
