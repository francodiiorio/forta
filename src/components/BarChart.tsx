import { formatNumber } from '../utils/format'

interface BarChartDatum {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartDatum[]
}

const VIEW_WIDTH = 300
const VIEW_HEIGHT = 100
/** Headroom reserved above the tallest bar so its value label doesn't get clipped. */
const LABEL_AREA = 16

function formatBarValue(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return formatNumber(value)
}

/**
 * Minimal inline SVG bar chart — no charting library, per the stack
 * constraints. Each bar carries its own value label (D-043); still
 * `aria-hidden` since callers render an accessible table or list with
 * the same numbers alongside it, which stays the data's real home for
 * screen readers and for tests.
 */
export function BarChart({ data }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barWidth = VIEW_WIDTH / Math.max(1, data.length)
  const plotHeight = VIEW_HEIGHT - LABEL_AREA

  return (
    <svg className="chart" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      {data.map((d, index) => {
        const barHeight = (d.value / max) * plotHeight
        const x = index * barWidth + barWidth * 0.15
        const barTop = VIEW_HEIGHT - barHeight
        return (
          <g key={d.label}>
            <rect className="chart-bar" x={x} y={barTop} width={barWidth * 0.7} height={barHeight} />
            {d.value > 0 && (
              <text className="chart-bar-value" x={x + barWidth * 0.35} y={barTop - 3} textAnchor="middle">
                {formatBarValue(d.value)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
