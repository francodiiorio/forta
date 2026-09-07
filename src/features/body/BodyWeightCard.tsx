import { ScaleIcon } from '../../components/icons'
import { LineChart } from '../../components/LineChart'
import { formatNumber } from '../../utils/format'
import { useBodyMeasurements } from './useBodyMeasurements'

/** Latest body weight + recent trend, for the home dashboard. */
export function BodyWeightCard() {
  const { measurements, loading } = useBodyMeasurements()

  if (loading) {
    return (
      <section className="card" aria-label="Peso corporal">
        <h4>
          <ScaleIcon className="icon-inline" /> Peso corporal
        </h4>
        <p className="muted">Cargando…</p>
      </section>
    )
  }

  if (measurements.length === 0) {
    return (
      <section className="card" aria-label="Peso corporal">
        <h4>
          <ScaleIcon className="icon-inline" /> Peso corporal
        </h4>
        <p className="muted">Registrá tu peso desde Perfil para ver la tendencia acá.</p>
      </section>
    )
  }

  // measurements are sorted most-recent-first; charts read oldest-first.
  const recent = [...measurements].slice(0, 10).reverse()

  return (
    <section className="card" aria-label="Peso corporal">
      <h4>
        <ScaleIcon className="icon-inline" /> Peso corporal
      </h4>
      <p className="stat-value">
        {formatNumber(measurements[0].bodyWeight)} <span className="stat-unit">kg</span>
      </p>
      {recent.length > 1 && <LineChart values={recent.map((m) => m.bodyWeight)} />}
    </section>
  )
}
