import { useState } from 'react'
import type { UserProfile } from '../../domain/profile/userProfile'
import { useUserProfile } from './useUserProfile'

interface HeightFormProps {
  profile: UserProfile
  onSave: (height: number) => Promise<void>
}

/**
 * Remounted (via the `key` on its call site) once the profile finishes
 * loading, so its initial state picks up the loaded height without a
 * setState-in-effect sync — see React's guidance on resetting state with
 * `key` instead of an Effect when a value changes identity.
 */
function HeightForm({ profile, onSave }: HeightFormProps) {
  const [height, setHeight] = useState(profile.height !== undefined ? String(profile.height) : '')
  const canSubmit = height.trim().length > 0 && Number(height) > 0

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    await onSave(Number(height))
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <label className="field">
        Altura (cm)
        <input
          type="number"
          step="1"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
          placeholder="0"
        />
      </label>
      <button type="submit" className="button-primary" disabled={!canSubmit}>
        Guardar
      </button>
    </form>
  )
}

/** Static personal info — currently just height. Body weight lives in BodyWeightSection since it's a time series, not a fixed attribute. */
export function ProfileInfoSection() {
  const { profile, loading, updateHeight } = useUserProfile()

  return (
    <section className="card" aria-label="Datos personales">
      <h2>Datos personales</h2>

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : (
        <HeightForm key={profile.height} profile={profile} onSave={updateHeight} />
      )}
    </section>
  )
}
