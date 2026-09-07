import { useId } from 'react'

interface LineChartProps {
  values: number[]
}

const VIEW_WIDTH = 300
const VIEW_HEIGHT = 100

/**
 * Minimal inline SVG line chart for a single trend series — a soft
 * gradient fill beneath the line, no per-point dots (D-043). See
 * BarChart for why this isn't a charting library and isn't the
 * accessible source of the data.
 */
export function LineChart({ values }: LineChartProps) {
  const gradientId = useId()

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
  const linePath = points.map(([x, y]) => `${x},${y}`).join(' ')
  const areaPath = `0,${VIEW_HEIGHT} ${linePath} ${VIEW_WIDTH},${VIEW_HEIGHT}`

  return (
    <svg className="chart" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="chart-area-stop-start" />
          <stop offset="100%" className="chart-area-stop-end" />
        </linearGradient>
      </defs>
      <polygon points={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <polyline className="chart-line" points={linePath} />
    </svg>
  )
}
