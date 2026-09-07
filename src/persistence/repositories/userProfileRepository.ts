import type { UserProfile } from '../../domain/profile/userProfile'
import { STORE_NAMES } from '../indexedDb/schema'
import { createRepository } from './createRepository'

export const userProfileRepository = createRepository<UserProfile>(STORE_NAMES.userProfile)
