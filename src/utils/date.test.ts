import { describe, expect, it } from 'vitest'
import { dateInputToISODateTime, isoDateTimeToDateInput } from './date'

describe('dateInputToISODateTime', () => {
  it('anchors to UTC midnight, independent of the runtime timezone', () => {
    // Not "some ISO string that happens to start with the right date" —
    // exactly UTC midnight. A local-time parse would only pass this for
    // a runtime already at UTC.
    expect(dateInputToISODateTime('2026-03-15')).toBe('2026-03-15T00:00:00.000Z')
  })

  it('round-trips through isoDateTimeToDateInput', () => {
    expect(isoDateTimeToDateInput(dateInputToISODateTime('2026-12-31'))).toBe('2026-12-31')
  })
})

describe('isoDateTimeToDateInput', () => {
  it('takes the date portion of an ISO instant', () => {
    expect(isoDateTimeToDateInput('2026-03-15T14:30:00.000Z')).toBe('2026-03-15')
  })
})
