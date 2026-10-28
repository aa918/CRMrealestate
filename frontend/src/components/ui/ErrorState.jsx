import { AlertTriangle } from "lucide-react"
import Button from "./Button"

export default function ErrorState({ title = "משהו השתבש", description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-white px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-danger">
        <AlertTriangle className="size-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-1">
          ניסיון חזרה
        </Button>
      )}
    </div>
  )
}
