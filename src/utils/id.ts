import type { Id } from '../types/common'

/** Generates a new entity identifier. The only place ID generation should happen. */
export function generateId(): Id {
  return crypto.randomUUID()
}
