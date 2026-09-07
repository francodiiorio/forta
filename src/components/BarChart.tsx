interface BarChartDatum {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartDatum[]
}

const VIEW_WIDTH = 300
const VIEW_HEIGHT = 100

/**
 * Minimal inline SVG bar chart — no charting library, per the stack
 * constraints. Decorative (`aria-hidden`): callers render an accessible
 * table or list with the same numbers alongside it, which stays the
 * data's real home for screen readers and for tests.
 */
export function BarChart({ data }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barWidth = VIEW_WIDTH / Math.max(1, data.length)

  return (
    <svg className="chart" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      {data.map((d, index) => {
        const barHeight = (d.value / max) * VIEW_HEIGHT
        return (
          <rect
            key={d.label}
            className="chart-bar"
            x={index * barWidth + barWidth * 0.15}
            y={VIEW_HEIGHT - barHeight}
            width={barWidth * 0.7}
            height={barHeight}
          />
        )
      })}
    </svg>
  )
}
