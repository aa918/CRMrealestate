import { CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import Card from "../ui/Card"
import StatusBadge from "../ui/StatusBadge"
import { formatDateTime } from "../../lib/format"
import { INTEGRATION_RESULT_TONE } from "../../lib/statusTones"

export default function AutomationCard({ icon: Icon, title, description, configured, configuredLabel, lastEvent, lastResult, lastExecutedAt, lastError, children }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-info-bg text-brand">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text">{title}</h3>
            <p className="text-xs text-muted">{description}</p>
          </div>
        </div>
        <StatusBadge tone={configured ? "success" : "neutral"}>
          {configured ? "מחובר" : configuredLabel || "טרם חובר"}
        </StatusBadge>
      </div>

      <div className="rounded-xl bg-slate-50 p-3 text-xs">
        {lastExecutedAt ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted">
              {lastResult === "SUCCESS" || lastResult === "PROCESSED" ? (
                <CheckCircle2 className="size-3.5 text-success" />
              ) : (
                <XCircle className="size-3.5 text-danger" />
              )}
              הרצה אחרונה: {lastEvent || "—"}
            </span>
            <span className="text-muted">{formatDateTime(lastExecutedAt)}</span>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-muted">
            <HelpCircle className="size-3.5" />
            סטטוס לא זמין - עדיין לא בוצעה הרצה
          </span>
        )}
        {lastResult && lastResult !== "SUCCESS" && lastResult !== "PROCESSED" && (
          <StatusBadge tone={INTEGRATION_RESULT_TONE[lastResult] || "neutral"} className="mt-2">
            {lastError ? `נכשל: ${lastError}` : lastResult}
          </StatusBadge>
        )}
      </div>

      {children}
    </Card>
  )
}
