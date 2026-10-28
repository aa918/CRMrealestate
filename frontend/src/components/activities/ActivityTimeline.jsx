import {
  Phone,
  MessageCircle,
  Mail,
  Users,
  StickyNote,
  UserPlus,
  RefreshCw,
  ListChecks,
  Cog,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react"
import LoadingSkeleton from "../ui/LoadingSkeleton"
import EmptyState from "../ui/EmptyState"
import { formatDateTime, fullName } from "../../lib/format"
import { ACTIVITY_TYPE_LABELS } from "../../lib/enums"

const ICONS = {
  CALL: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: StickyNote,
  LEAD_CREATED: UserPlus,
  STATUS_CHANGED: RefreshCw,
  TASK_CREATED: ListChecks,
  SYSTEM: Cog,
}

export default function ActivityTimeline({ activities, isLoading, emptyHint }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <LoadingSkeleton className="h-16" />
        <LoadingSkeleton className="h-16" />
        <LoadingSkeleton className="h-16" />
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return <EmptyState title="אין עדיין פעילות מתועדת" description={emptyHint || "פעילויות יתועדו כאן אוטומטית"} />
  }

  return (
    <ol className="relative space-y-4 border-r-2 border-border pr-5">
      {activities.map((activity) => {
        const Icon = ICONS[activity.type] || StickyNote
        return (
          <li key={activity.id} className="relative">
            <span className="absolute -right-[29px] top-0 flex size-7 items-center justify-center rounded-full bg-info-bg text-brand">
              <Icon className="size-3.5" />
            </span>
            <div className="rounded-xl border border-border bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-text">{activity.description}</p>
                {activity.direction && (
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted">
                    {activity.direction === "INBOUND" ? (
                      <ArrowDownLeft className="size-3" />
                    ) : (
                      <ArrowUpRight className="size-3" />
                    )}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">
                {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                {activity.user ? ` · ${fullName(activity.user)}` : ""} · {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
