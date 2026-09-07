import { BodyWeightSection } from '../body/BodyWeightSection'
import { DataBackupSection } from './DataBackupSection'

/** Settings: body weight logging and data export/import. */
export function SettingsSection() {
  return (
    <div aria-label="Ajustes">
      <h1 className="page-title">Ajustes</h1>
      <BodyWeightSection />
      <DataBackupSection />
    </div>
  )
}
