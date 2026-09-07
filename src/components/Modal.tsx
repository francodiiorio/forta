import { useEffect } from 'react'
import { CloseIcon } from './icons'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

/**
 * Dependency-free modal, same reasoning as BarChart/LineChart (D-032).
 * Stays mounted at all times and toggles a class instead of conditionally
 * rendering — `visibility` (with a transition delay only on close) drives
 * both the fade/scale transition and hides it from focus, tabbing, and
 * screen readers while closed, with no JS timers needed for either.
 *
 * A bottom sheet on mobile (same nav-repositioning pattern as D-040: one
 * markup, media query moves it), a centered dialog on desktop — both with
 * a frosted-glass panel (`backdrop-filter`) over a blurred backdrop
 * (D-047). `.modal-handle` is a static drag-affordance visual, not an
 * actual swipe gesture — hidden on desktop where the sheet isn't anchored
 * to an edge.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <div className={`modal-backdrop${open ? ' modal-open' : ''}`} onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-handle" aria-hidden="true" />
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
