/** Rounds a number for display (at most one decimal place, no trailing zeros). */
export function formatNumber(value: number): string {
  return Number(value.toFixed(1)).toString()
}
