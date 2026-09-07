import 'fake-indexeddb/auto'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// With `globals: false`, @testing-library/react's automatic afterEach
// cleanup never registers (it looks for a global `afterEach`), so every
// component test would otherwise leak its render into the next one.
afterEach(cleanup)
