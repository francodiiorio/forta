import type { ISODateTimeString } from '../types/common'

/**
 * Converts a `<input type="date">` value ("YYYY-MM-DD") to an ISO
 * instant, anchored to UTC midnight. Anchoring matters: parsing
 * "T00:00:00" without a zone parses as the *runtime's local* midnight,
 * which for a positive UTC offset rolls back into the previous UTC date
 * — the date a user picked could get silently stored (and later
 * date-range-filtered) as the day before it. UTC midnight keeps the
 * stored date's first 10 characters identical to what was picked,
 * regardless of the runtime's timezone.
 */
export function dateInputToISODateTime(dateInputValue: string): ISODateTimeString {
  return new Date(`${dateInputValue}T00:00:00Z`).toISOString()
}

/** Converts an ISO instant back to the "YYYY-MM-DD" shape `<input type="date">` expects. */
export function isoDateTimeToDateInput(iso: ISODateTimeString): string {
  return iso.slice(0, 10)
}
