import { DataBackupSection } from './DataBackupSection'
import { ThemeSection } from './ThemeSection'

/** Settings: appearance and data export/import. Profile info and body weight live under the Perfil tab — see docs/DECISIONS.md D-042. */
export function SettingsSection() {
  return (
    <div aria-label="Ajustes">
      <h1 className="page-title">Ajustes</h1>
      <ThemeSection />
      <DataBackupSection />
    </div>
  )
}
