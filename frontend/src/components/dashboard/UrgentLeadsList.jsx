import { useNavigate } from "react-router-dom"
import { AlarmClock, ArrowLeft } from "lucide-react"
import Card from "../ui/Card"
import StatusBadge from "../ui/StatusBadge"
import EmptyState from "../ui/EmptyState"
import LoadingSkeleton from "../ui/LoadingSkeleton"
import Button from "../ui/Button"
import { fullName, formatDuration } from "../../lib/format"
import { LEAD_SOURCE_LABELS, INTEREST_TYPE_LABELS, RESPONSE_STATUS_LABELS } from "../../lib/enums"
import { RESPONSE_STATUS_TONE } from "../../lib/statusTones"

export default function UrgentLeadsList({ leads, isLoading }) {
  const navigate = useNavigate()

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-text">לידים שדורשים תשומת לב</h3>
          <p className="text-xs text-muted">מסודר לפי דחיפות - חריגת SLA לפני לידים ממתינים</p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-lg bg-danger-bg text-danger">
          <AlarmClock className="size-4" />
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4">
          <LoadingSkeleton className="h-14" />
          <LoadingSkeleton className="h-14" />
          <LoadingSkeleton className="h-14" />
        </div>
      ) : !leads || leads.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="אין עדיין לידים להצגה"
            description="כל הלידים נענו בזמן - עבודה מצוינת"
            actionLabel="הוספת ליד"
            onAction={() => navigate("/leads?new=1")}
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {leads.map((lead) => (
            <li key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-text">{fullName(lead.contact)}</p>
                  <StatusBadge tone={RESPONSE_STATUS_TONE[lead.responseStatus]}>
                    {RESPONSE_STATUS_LABELS[lead.responseStatus]}
                  </StatusBadge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">
                  <span dir="ltr">{lead.contact?.phone}</span> · {INTEREST_TYPE_LABELS[lead.interestType] || "—"} ·{" "}
                  {LEAD_SOURCE_LABELS[lead.source]}
                  {lead.city ? ` · ${lead.city}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-left">
                <p className="text-xs font-medium text-text">{formatDuration(lead.receivedAt)}</p>
                <p className="text-[11px] text-muted">
                  {lead.assignedUser ? fullName(lead.assignedUser) : "לא מוקצה"}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/leads?open=${lead.id}`)}>
                פתיחה
                <ArrowLeft className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
