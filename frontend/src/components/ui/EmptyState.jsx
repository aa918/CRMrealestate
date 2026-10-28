import { Inbox } from "lucide-react"
import Button from "./Button"

export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-info-bg text-brand">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
