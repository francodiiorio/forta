import 'fake-indexeddb/auto'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// With `globals: false`, @testing-library/react's automatic afterEach
// cleanup never registers (it looks for a global `afterEach`), so every
// component test would otherwise leak its render into the next one.
afterEach(cleanup)

// jsdom's Blob/File implementation has no `.text()` (nor `.arrayBuffer()`
// or `.stream()` — checked directly against jsdom 27) even though it's a
// standard method real browsers have supported for years. This isn't an
// app bug to work around in production code; it's the same kind of gap
// `fake-indexeddb` already patches for IndexedDB. `FileReader` is the one
// async Blob-reading API jsdom does implement, so it's the polyfill base.
if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = function (this: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(this)
    })
  }
}
