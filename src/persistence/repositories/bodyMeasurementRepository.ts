import type { BodyMeasurement } from '../../domain/body/bodyMeasurement'
import { STORE_NAMES } from '../indexedDb/schema'
import { createRepository } from './createRepository'

export const bodyMeasurementRepository = createRepository<BodyMeasurement>(STORE_NAMES.bodyMeasurements)
