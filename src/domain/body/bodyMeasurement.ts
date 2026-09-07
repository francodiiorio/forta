import type { Id, ISODateTimeString } from '../../types/common'

/** A point-in-time body measurement entry. See docs/DATA_MODEL.md. */
export interface BodyMeasurement {
  id: Id
  date: ISODateTimeString
  bodyWeight: number
  bodyFatPercentage?: number
  waist?: number
  chest?: number
  armLeft?: number
  armRight?: number
  thighLeft?: number
  thighRight?: number
  calfLeft?: number
  calfRight?: number
  notes?: string
}
