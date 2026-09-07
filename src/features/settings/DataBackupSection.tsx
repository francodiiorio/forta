import { useRef, useState } from 'react'
import { exportBackup, importBackup } from '../../persistence/backup/backup'
import { BackupValidationError } from '../../persistence/backup/validateBackupFile'
import { DownloadIcon, UploadIcon } from '../../components/icons'

type ImportState =
  | { status: 'idle' }
  | { status: 'confirming'; fileName: string; parsed: unknown }
  | { status: 'error'; message: string }
  | { status: 'done' }

/**
 * Export/import all locally stored data as a portable, versioned JSON
 * file — see docs/PRODUCT.md and docs/DECISIONS.md D-013. Import
 * restores (replaces), so it's gated behind an explicit inline
 * confirmation rather than acting immediately on file selection.
 */
export function DataBackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importState, setImportState] = useState<ImportState>({ status: 'idle' })

  async function handleExport() {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `forta-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const parsed = JSON.parse(await file.text())
      setImportState({ status: 'confirming', fileName: file.name, parsed })
    } catch {
      setImportState({ status: 'error', message: 'El archivo no es un JSON válido.' })
    }
  }

  async function confirmImport() {
    if (importState.status !== 'confirming') return

    try {
      await importBackup(importState.parsed)
      setImportState({ status: 'done' })
    } catch (error) {
      const message = error instanceof BackupValidationError ? error.message : 'No se pudo importar el archivo.'
      setImportState({ status: 'error', message })
    }
  }

  return (
    <section className="card" aria-label="Datos">
      <h2>Datos</h2>
      <p className="muted">Exportá todo lo guardado a un archivo, o restaurá desde uno anterior.</p>

      <div className="button-group">
        <button type="button" onClick={handleExport}>
          <DownloadIcon className="icon-inline" /> Exportar datos
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          <UploadIcon className="icon-inline" /> Importar datos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileSelected}
          style={{ display: 'none' }}
        />
      </div>

      {importState.status === 'confirming' && (
        <div className="confirm-banner">
          <p>
            Importar <strong>{importState.fileName}</strong> reemplaza todos los datos guardados en este
            dispositivo. Esta acción no se puede deshacer.
          </p>
          <div className="button-group">
            <button type="button" className="button-danger" onClick={confirmImport}>
              Reemplazar datos
            </button>
            <button type="button" onClick={() => setImportState({ status: 'idle' })}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {importState.status === 'error' && (
        <div className="confirm-banner">
          <p className="error-text">{importState.message}</p>
          <button type="button" onClick={() => setImportState({ status: 'idle' })}>
            Cerrar
          </button>
        </div>
      )}

      {importState.status === 'done' && (
        <div className="confirm-banner">
          <p className="status-message">Datos importados. Recargá la app para verlos reflejados en todas las secciones.</p>
          <button type="button" className="button-primary" onClick={() => window.location.reload()}>
            Recargar ahora
          </button>
        </div>
      )}
    </section>
  )
}
