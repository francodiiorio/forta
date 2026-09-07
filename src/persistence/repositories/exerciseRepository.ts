import type { Exercise } from '../../domain/exercise/exercise'
import { STORE_NAMES } from '../indexedDb/schema'
import { createRepository } from './createRepository'

export const exerciseRepository = createRepository<Exercise>(STORE_NAMES.exercises)
