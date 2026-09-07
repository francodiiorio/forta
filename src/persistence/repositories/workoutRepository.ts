import type { Workout } from '../../domain/workout/workout'
import { STORE_NAMES } from '../indexedDb/schema'
import { createRepository } from './createRepository'

export const workoutRepository = createRepository<Workout>(STORE_NAMES.workouts)
