interface LineChartProps {
  values: number[]
}

const VIEW_WIDTH = 300
const VIEW_HEIGHT = 100

/**
 * Minimal inline SVG line chart for a single trend series — see
 * BarChart for why this isn't a charting library and isn't the
 * accessible source of the data.
 */
export function LineChart({ values }: LineChartProps) {
  if (values.length === 0) return null

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min

  function toXY(value: number, index: number): [number, number] {
    const x = values.length > 1 ? (index / (values.length - 1)) * VIEW_WIDTH : VIEW_WIDTH / 2
    const y = range === 0 ? VIEW_HEIGHT / 2 : VIEW_HEIGHT - ((value - min) / range) * VIEW_HEIGHT
    return [x, y]
  }

  const points = values.map((value, index) => toXY(value, index))

  return (
    <svg className="chart" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline className="chart-line" points={points.map(([x, y]) => `${x},${y}`).join(' ')} />
      {points.map(([x, y], index) => (
        <circle key={index} className="chart-point" cx={x} cy={y} r={3} />
      ))}
    </svg>
  )
}
