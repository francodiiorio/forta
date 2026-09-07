import { useCallback, useEffect, useState } from 'react'
import type { BodyMeasurement } from '../../domain/body/bodyMeasurement'
import { bodyMeasurementRepository } from '../../persistence/repositories/bodyMeasurementRepository'
import { dateInputToISODateTime } from '../../utils/date'
import { generateId } from '../../utils/id'

export interface BodyMeasurementsApi {
  measurements: BodyMeasurement[]
  loading: boolean
  addWeight: (bodyWeight: number, date: string) => Promise<BodyMeasurement>
}

/**
 * Loads body measurements, most recent first. Only `bodyWeight` is
 * exposed through the UI for now — the rest of the entity's optional
 * fields (see docs/DATA_MODEL.md) are modeled but not surfaced yet,
 * per docs/PRODUCT.md ("no hace falta implementar toda la interfaz de
 * medidas corporales en la primera etapa").
 */
export function useBodyMeasurements(): BodyMeasurementsApi {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const all = await bodyMeasurementRepository.getAll()
    setMeasurements([...all].sort((a, b) => b.date.localeCompare(a.date)))
    setLoading(false)
  }, [])

  // Loading from IndexedDB on mount; reload's state updates happen after
  // its `await`, not synchronously (see useExercises for the longer version).
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- see above
    reload()
  }, [reload])

  const addWeight = useCallback(
    async (bodyWeight: number, date: string) => {
      const measurement: BodyMeasurement = { id: generateId(), date: dateInputToISODateTime(date), bodyWeight }
      await bodyMeasurementRepository.add(measurement)
      await reload()
      return measurement
    },
    [reload],
  )

  return { measurements, loading, addWeight }
}
