import { formatNumber } from '../utils/format'

interface BarChartDatum {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartDatum[]
}

function formatBarValue(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return formatNumber(value)
}

/**
 * Minimal CSS bar chart — no charting library, per the stack
 * constraints. Plain flexbox columns rather than an SVG viewBox: an SVG
 * scaled with `preserveAspectRatio="none"` to fill a wide card stretches
 * everything non-uniformly, which visibly warps the value labels at
 * desktop widths (D-044). Still `aria-hidden`: callers render an
 * accessible table or list with the same numbers alongside it, which
 * stays the data's real home for screen readers and for tests.
 */
export function BarChart({ data }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="bar-chart" aria-hidden="true">
      {data.map((d) => (
        <div key={d.label} className="bar-chart-column">
          <span className="bar-chart-value">{d.value > 0 ? formatBarValue(d.value) : ''}</span>
          <div className="bar-chart-bar" style={{ height: `${(d.value / max) * 100}%` }} />
        </div>
      ))}
    </div>
  )
}
