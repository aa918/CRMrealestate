import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import clsx from "clsx"

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        className={clsx(
          "relative z-10 flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-xl",
          sizes[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="focus-ring flex size-8 items-center justify-center rounded-lg text-muted hover:bg-slate-100"
            aria-label="סגור"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
