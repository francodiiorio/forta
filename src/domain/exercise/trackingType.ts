/** How a set of an exercise is recorded. See docs/FITNESS_DOMAIN.md. */
export const TRACKING_TYPES = [
  'WEIGHT_REPS',
  'BODYWEIGHT_REPS',
  'ASSISTED_BODYWEIGHT',
  'REPS_ONLY',
  'TIME',
] as const

export type TrackingType = (typeof TRACKING_TYPES)[number]

/**
 * Whether a set of this tracking type records a weight value.
 * ASSISTED_BODYWEIGHT records weight too, but as assistance (reduces
 * effective load), not added load — see docs/FITNESS_DOMAIN.md.
 */
export function requiresWeight(trackingType: TrackingType): boolean {
  return trackingType === 'WEIGHT_REPS' || trackingType === 'ASSISTED_BODYWEIGHT'
}

/** Whether a set of this tracking type records reps (as opposed to TIME). */
export function requiresReps(trackingType: TrackingType): boolean {
  return trackingType !== 'TIME'
}
