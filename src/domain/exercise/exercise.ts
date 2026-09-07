import type { Id } from '../../types/common'
import type { Muscle } from '../muscle/muscle'
import type { TrackingType } from './trackingType'

export const LATERALITIES = ['BILATERAL', 'UNILATERAL'] as const
export type Laterality = (typeof LATERALITIES)[number]

export const EQUIPMENT = [
  'BARBELL',
  'DUMBBELL',
  'MACHINE',
  'CABLE',
  'BODYWEIGHT',
  'KETTLEBELL',
  'BAND',
  'OTHER',
] as const
export type Equipment = (typeof EQUIPMENT)[number]

export const EXERCISE_CATEGORIES = ['COMPOUND', 'ISOLATION'] as const
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number]

/** Catalog entry for a movement. See docs/DATA_MODEL.md. */
export interface Exercise {
  id: Id
  name: string
  primaryMuscles: Muscle[]
  secondaryMuscles: Muscle[]
  equipment: Equipment
  trackingType: TrackingType
  laterality: Laterality
  category: ExerciseCategory
}
