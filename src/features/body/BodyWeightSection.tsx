import { useState } from 'react'
import { isoDateTimeToDateInput } from '../../utils/date'
import { formatNumber } from '../../utils/format'
import { useBodyMeasurements } from './useBodyMeasurements'

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Log body weight over time. Other BodyMeasurement fields aren't exposed yet — see docs/PRODUCT.md. */
export function BodyWeightSection() {
  const { measurements, loading, addWeight } = useBodyMeasurements()
  const [date, setDate] = useState(todayDateOnly)
  const [weight, setWeight] = useState('')

  const canSubmit = weight.trim().length > 0 && Number(weight) > 0

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    await addWeight(Number(weight), date)
    setWeight('')
    setDate(todayDateOnly())
  }

  return (
    <section className="card" aria-label="Peso corporal">
      <h2>Peso corporal</h2>

      <form onSubmit={handleSubmit} className="inline-form">
        <label className="field">
          Fecha
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="field">
          Peso (kg)
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder="0.0"
          />
        </label>
        <button type="submit" className="button-primary" disabled={!canSubmit}>
          Guardar
        </button>
      </form>

      {loading && <p className="muted">Cargando…</p>}

      {!loading && measurements.length === 0 && <p className="muted">Todavía no registraste tu peso.</p>}

      {!loading && measurements.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Peso (kg)</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((measurement) => (
                <tr key={measurement.id}>
                  <td>{isoDateTimeToDateInput(measurement.date)}</td>
                  <td>{formatNumber(measurement.bodyWeight)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
