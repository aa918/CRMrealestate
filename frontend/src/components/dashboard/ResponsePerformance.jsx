import Card from "../ui/Card"
import LoadingSkeleton from "../ui/LoadingSkeleton"
import { Timer } from "lucide-react"
import { formatMinutes } from "../../lib/format"

function pct(n, total) {
  if (!total) return 0
  return Math.round((n / total) * 100)
}

export default function ResponsePerformance({ summary, performance, isLoading }) {
  if (isLoading) return <LoadingSkeleton className="h-48" />

  const waiting = summary?.waitingLeads ?? 0
  const overdue = summary?.overdueLeads ?? 0
  const responded = performance?.sampleSize ?? 0
  const total = waiting + overdue + responded

  const respondedPct = pct(responded, total)
  const waitingPct = pct(waiting, total)
  const overduePct = pct(overdue, total)

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">ביצועי זמן תגובה</h3>
          <p className="text-xs text-muted">
            {total > 0 ? `מבוסס על ${total} לידים` : "אין עדיין מספיק נתונים"} · SLA: {performance?.slaMinutes ?? 15} דק׳
          </p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-lg bg-info-bg text-brand">
          <Timer className="size-4" />
        </span>
      </div>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-muted">אין עדיין לידים להצגה</p>
      ) : (
        <>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
            {respondedPct > 0 && <div className="bg-success" style={{ width: `${respondedPct}%` }} />}
            {waitingPct > 0 && <div className="bg-warning" style={{ width: `${waitingPct}%` }} />}
            {overduePct > 0 && <div className="bg-danger" style={{ width: `${overduePct}%` }} />}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-success">{respondedPct}%</p>
              <p className="text-xs text-muted">נענו</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning">{waitingPct}%</p>
              <p className="text-xs text-muted">ממתינים</p>
            </div>
            <div>
              <p className="text-lg font-bold text-danger">{overduePct}%</p>
              <p className="text-xs text-muted">חריגת SLA</p>
            </div>
          </div>

          {performance?.averageResponseTimeMinutes != null && (
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
              זמן תגובה ממוצע: <span className="font-medium text-text">{formatMinutes(performance.averageResponseTimeMinutes)}</span>
              {performance?.medianResponseTimeMinutes != null && (
                <>
                  {" "}· חציוני: <span className="font-medium text-text">{formatMinutes(performance.medianResponseTimeMinutes)}</span>
                </>
              )}
            </p>
          )}
        </>
      )}
    </Card>
  )
}
