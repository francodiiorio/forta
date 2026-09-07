import { useCallback, useEffect, useState } from 'react'
import { USER_PROFILE_ID, type UserProfile } from '../../domain/profile/userProfile'
import { userProfileRepository } from '../../persistence/repositories/userProfileRepository'

export interface UserProfileApi {
  profile: UserProfile
  loading: boolean
  updateHeight: (height: number) => Promise<void>
}

const EMPTY_PROFILE: UserProfile = { id: USER_PROFILE_ID }

/** Loads the single profile record (creating none until the user saves a first field). */
export function useUserProfile(): UserProfileApi {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setProfile((await userProfileRepository.getById(USER_PROFILE_ID)) ?? EMPTY_PROFILE)
    setLoading(false)
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- see useExercises for why this is fine
    reload()
  }, [reload])

  const updateHeight = useCallback(
    async (height: number) => {
      const updated: UserProfile = { ...profile, id: USER_PROFILE_ID, height }
      await userProfileRepository.update(updated)
      await reload()
    },
    [profile, reload],
  )

  return { profile, loading, updateHeight }
}
