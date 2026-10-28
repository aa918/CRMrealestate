import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

export default function SidePanel({ open, onClose, title, subtitle, children, headerExtra }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative mr-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl panel-slide-in">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-text">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button
              onClick={onClose}
              className="focus-ring flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-slate-100"
              aria-label="סגור"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  )
}
