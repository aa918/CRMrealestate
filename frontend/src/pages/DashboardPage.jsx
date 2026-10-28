import { UserPlus, Clock, Timer, CalendarCheck } from "lucide-react"
import MetricCard from "../components/ui/MetricCard"
import { CardsSkeleton } from "../components/ui/LoadingSkeleton"
import LeadsChart from "../components/dashboard/LeadsChart"
import ResponsePerformance from "../components/dashboard/ResponsePerformance"
import UrgentLeadsList from "../components/dashboard/UrgentLeadsList"
import { useAuth } from "../context/AuthContext"
import { useDashboardSummary, useResponsePerformance } from "../hooks/useDashboard"
import { useUrgentLeads } from "../hooks/useUrgentLeads"
import { useLeadsTrend } from "../hooks/useLeadsTrend"
import { useTasks } from "../hooks/useTasks"
import { greeting, formatMinutes } from "../lib/format"

function startOfWeek() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay()) // Sunday
  return d
}
function endOfWeek() {
  const d = startOfWeek()
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useDashboardSummary()
  const { data: performance, isLoading: perfLoading } = useResponsePerformance()
  const { data: urgentLeads, isLoading: urgentLoading } = useUrgentLeads(6)
  const { data: trend, isLoading: trendLoading } = useLeadsTrend(7)
  const { data: meetingsWeek, isLoading: meetingsLoading } = useTasks({
    type: "MEETING",
    dueFrom: startOfWeek().toISOString(),
    dueTo: endOfWeek().toISOString(),
    limit: 1,
  })

  const metricsLoading = summaryLoading || meetingsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">
          {greeting()}{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted">כל מה שחשוב לדעת על הפעילות במשרד שלך</p>
      </div>

      {metricsLoading ? (
        <CardsSkeleton count={4} />
      ) : summaryError ? (
        <p className="text-sm text-danger">לא ניתן לטעון את נתוני הסקירה כעת.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={UserPlus} label="לידים חדשים היום" value={summary?.newLeadsToday ?? 0} tone="brand" />
          <MetricCard icon={Clock} label="ממתינים למענה" value={summary?.waitingLeads ?? 0} tone="warning" />
          <MetricCard
            icon={Timer}
            label="זמן תגובה ממוצע"
            value={formatMinutes(summary?.averageResponseTimeMinutes)}
            tone="success"
          />
          <MetricCard icon={CalendarCheck} label="פגישות השבוע" value={meetingsWeek?.pagination?.total ?? 0} tone="brand" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LeadsChart data={trend?.points} isLoading={trendLoading} />
        </div>
        <div className="lg:col-span-2">
          <ResponsePerformance summary={summary} performance={performance} isLoading={summaryLoading || perfLoading} />
        </div>
      </div>

      <UrgentLeadsList leads={urgentLeads} isLoading={urgentLoading} />
    </div>
  )
}
