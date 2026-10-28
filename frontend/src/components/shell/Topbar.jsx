import { useNavigate } from "react-router-dom"
import { Menu, Bell, ChevronLeft } from "lucide-react"
import clsx from "clsx"
import { useHealth } from "../../hooks/useHealth"
import { useDashboardSummary } from "../../hooks/useDashboard"
import Avatar from "../ui/Avatar"
import { useAuth } from "../../context/AuthContext"

function HealthIndicator() {
  const { data, isError, isLoading } = useHealth()
  const connected = !isError && data?.status === "ok" && data?.database === "connected"

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs text-muted"
      title={connected ? "השרת והמסד נתונים מחוברים" : "אין חיבור לשרת"}
    >
      <span
        className={clsx(
          "size-1.5 rounded-full",
          isLoading ? "bg-slate-300" : connected ? "bg-success" : "bg-danger"
        )}
      />
      {isLoading ? "בודק חיבור..." : connected ? "המערכת מחוברת" : "אין חיבור"}
    </div>
  )
}

function NotificationsBell() {
  const navigate = useNavigate()
  const { data } = useDashboardSummary()
  const pending = (data?.overdueLeads || 0) + (data?.overdueTasks || 0)

  return (
    <button
      onClick={() => navigate("/leads?responseStatus=OVERDUE")}
      className="focus-ring relative flex size-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100"
      title={pending > 0 ? `${pending} פריטים דורשים תשומת לב` : "אין פריטים דחופים"}
    >
      <Bell className="size-[18px]" />
      {pending > 0 && (
        <span className="absolute -top-1 -left-1 flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {pending > 99 ? "99+" : pending}
        </span>
      )}
    </button>
  )
}

export default function Topbar({ title, breadcrumbs, onMenuClick, actions }) {
  const { user, organization } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="focus-ring flex size-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-text">{title}</h1>
          </div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronLeft className="size-3" />}
                  {b}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <HealthIndicator />
        <NotificationsBell />
        <div className="hidden items-center gap-2 border-r border-border pr-3 sm:flex">
          <div className="text-left">
            <p className="text-sm font-medium text-text leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted leading-tight">{organization?.name}</p>
          </div>
          <Avatar user={user} size="sm" />
        </div>
      </div>
    </header>
  )
}
