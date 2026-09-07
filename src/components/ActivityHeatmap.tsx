interface ActivityHeatmapProps {
  /** "YYYY-MM-DD" dates that had a workout. */
  activeDates: Set<string>
  /** How many days to show, ending today. */
  days: number
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Grid of the last N days, marking which ones had a workout. Accessible via title text per cell. */
export function ActivityHeatmap({ activeDates, days }: ActivityHeatmapProps) {
  const today = new Date()
  const cells = Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - index))
    return toDateString(date)
  })
  const todayString = toDateString(today)

  return (
    <div className="heatmap" role="list" aria-label={`Actividad de los últimos ${days} días`}>
      {cells.map((date) => (
        <div
          key={date}
          role="listitem"
          title={date}
          className={
            'heatmap-cell' +
            (activeDates.has(date) ? ' heatmap-cell-active' : '') +
            (date === todayString ? ' heatmap-cell-today' : '')
          }
        />
      ))}
    </div>
  )
}
