import clsx from "clsx"
import { Handshake } from "lucide-react"
import StatusBadge from "../ui/StatusBadge"
import { formatCurrency, formatDate, fullName } from "../../lib/format"
import { DEAL_STAGE_LABELS } from "../../lib/enums"
import { DEAL_STAGE_TONE } from "../../lib/statusTones"

export default function DealCard({ deal, onClick, draggable, onDragStart, compact }) {
  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={clsx(
        "rounded-xl border border-border bg-white p-3 transition-shadow",
        onClick && "cursor-pointer hover:shadow-md",
        draggable && "cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-text">{deal.title}</p>
        {!compact && <StatusBadge tone={DEAL_STAGE_TONE[deal.stage]}>{DEAL_STAGE_LABELS[deal.stage]}</StatusBadge>}
      </div>
      <p className="mt-1 text-sm font-semibold text-brand">{formatCurrency(deal.value)}</p>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span className="flex items-center gap-1 truncate">
          <Handshake className="size-3" />
          {fullName(deal.contact)}
        </span>
        <span>{deal.owner ? fullName(deal.owner) : ""}</span>
      </div>
      {deal.expectedCloseDate && (
        <p className="mt-1 text-[11px] text-muted">סגירה משוערת: {formatDate(deal.expectedCloseDate)}</p>
      )}
    </div>
  )
}
