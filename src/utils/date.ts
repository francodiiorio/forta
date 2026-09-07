import type { ISODateTimeString } from '../types/common'

/** Converts a `<input type="date">` value ("YYYY-MM-DD") to an ISO instant. */
export function dateInputToISODateTime(dateInputValue: string): ISODateTimeString {
  return new Date(`${dateInputValue}T00:00:00`).toISOString()
}

/** Converts an ISO instant back to the "YYYY-MM-DD" shape `<input type="date">` expects. */
export function isoDateTimeToDateInput(iso: ISODateTimeString): string {
  return iso.slice(0, 10)
}
