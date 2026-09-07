import type { Routine } from '../../domain/routine/routine'
import { STORE_NAMES } from '../indexedDb/schema'
import { createRepository } from './createRepository'

export const routineRepository = createRepository<Routine>(STORE_NAMES.routines)
