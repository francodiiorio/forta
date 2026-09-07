import { BodyWeightSection } from './BodyWeightSection'
import { ProfileInfoSection } from './ProfileInfoSection'

/** Personal data: static profile info (height) and body weight over time. Data export/import stays under Ajustes — see docs/DECISIONS.md D-042. */
export function ProfileSection() {
  return (
    <div aria-label="Perfil">
      <h1 className="page-title">Perfil</h1>
      <ProfileInfoSection />
      <BodyWeightSection />
    </div>
  )
}
