/** Muscles tracked for direct/indirect involvement. See docs/FITNESS_DOMAIN.md. */
export const MUSCLES = [
  'CHEST',
  'UPPER_BACK',
  'LATS',
  'TRAPS',
  'ANTERIOR_DELTOID',
  'LATERAL_DELTOID',
  'POSTERIOR_DELTOID',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
  'ABS',
  'OBLIQUES',
  'LOWER_BACK',
  'GLUTES',
  'QUADRICEPS',
  'HAMSTRINGS',
  'ADDUCTORS',
  'ABDUCTORS',
  'CALVES',
] as const

export type Muscle = (typeof MUSCLES)[number]
