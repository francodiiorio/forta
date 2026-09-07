import type { Id } from '../../types/common'

/**
 * This app tracks exactly one person, so there is exactly one profile
 * record — always stored and looked up under this fixed id, unlike every
 * other entity's generated id.
 */
export const USER_PROFILE_ID: Id = 'profile'

/** Static personal data. See BodyMeasurement for values that change over time. */
export interface UserProfile {
  id: Id
  height?: number
}
