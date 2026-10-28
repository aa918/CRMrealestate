import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import PageHeader from "../components/ui/PageHeader"
import Card from "../components/ui/Card"
import MetricCard from "../components/ui/MetricCard"
import { Input } from "../components/ui/FormField"
import { CardsSkeleton } from "../components/ui/LoadingSkeleton"
import ErrorState from "../components/ui/ErrorState"
import EmptyState from "../components/ui/EmptyState"
import { useReportsData } from "../hooks/useReports"
import { useResponsePerformance } from "../hooks/useDashboard"
import { formatCurrency, formatMinutes } from "../lib/format"
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "../lib/enums"
import { TrendingUp, Percent, Handshake, Timer } from "lucide-react"

const PALETTE = ["#3367DC", "#6FA3F5", "#1AA36B", "#C57A12", "#D13B3B", "#8290A4", "#8B5CF6", "#06B6D4", "#F97316"]

function isoDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function BreakdownChart({ title, data, labelMap }) {
  const chartData = data?.map((d) => ({ label: labelMap?.[d.key] || d.key, count: d.count })) || []
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-text">{title}</h3>
      {chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">אין נתונים בתקופה זו</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid horizontal={false} stroke="#E6EAF1" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#8290A4" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 11, fill: "#1E293B" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(isoDaysAgo(30).slice(0, 10))
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10))

  const { data, isLoading, isError, error, refetch } = useReportsData({
    dateFrom: new Date(dateFrom).toISOString(),
    dateTo: new Date(`${dateTo}T23:59:59`).toISOString(),
  })
  const { data: performance } = useResponsePerformance()

  return (
    <div>
      <PageHeader
        title="דוחות"
        description="ניתוח ביצועים אמיתי - לידים, סוכנים וזמני תגובה"
        actions={
          <div className="flex items-center gap-2 text-sm">
            <Input type="date" dir="ltr" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
            <span className="text-muted">עד</span>
            <Input type="date" dir="ltr" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
          </div>
        }
      />

      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : isError ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : !data?.sampleSize ? (
        <EmptyState icon={TrendingUp} title="אין נתונים להצגה בתקופה זו" description="נסו לבחור טווח תאריכים אחר" />
      ) : (
        <>
          {data.truncated && (
            <p className="mb-4 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
              הניתוח מבוסס על {data.sampleSize} מתוך {data.totalLeads} לידים בתקופה (המגבלה הטכנית הנוכחית היא 100 רשומות לדוח).
            </p>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={TrendingUp} label="לידים בתקופה" value={data.totalLeads} />
            <MetricCard icon={Percent} label="שיעור המרה (נסגרו בהצלחה)" value={data.conversionRate != null ? `${data.conversionRate}%` : "—"} tone="success" />
            <MetricCard icon={Handshake} label="עסקאות שנסגרו" value={`${data.closedDeals.won} / ${data.closedDeals.won + data.closedDeals.lost}`} hint={formatCurrency(data.closedDeals.wonValue)} tone="brand" />
            <MetricCard icon={Timer} label="עמידה ב-SLA (כולל היסטוריה)" value={performance ? `${performance.respondedUnderSla}/${performance.sampleSize}` : "—"} hint={performance ? `ממוצע ${formatMinutes(performance.averageResponseTimeMinutes)}` : ""} tone="warning" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BreakdownChart title="לידים לפי מקור" data={data.bySource} labelMap={LEAD_SOURCE_LABELS} />
            <BreakdownChart title="לידים לפי סטטוס" data={data.byStatus} labelMap={LEAD_STATUS_LABELS} />
          </div>

          <Card className="mt-4" padded={false}>
            <h3 className="px-5 pt-4 text-sm font-semibold text-text">ביצועי סוכנים</h3>
            <div className="overflow-x-auto">
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/70 text-right text-xs font-semibold text-muted">
                    <th className="px-5 py-2">סוכן</th>
                    <th className="px-5 py-2">לידים</th>
                    <th className="px-5 py-2">נסגרו בהצלחה</th>
                    <th className="px-5 py-2">זמן תגובה ממוצע</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byAgent.map((agent) => (
                    <tr key={agent.name} className="border-b border-border last:border-0">
                      <td className="px-5 py-2.5 font-medium text-text">{agent.name}</td>
                      <td className="px-5 py-2.5">{agent.leads}</td>
                      <td className="px-5 py-2.5">{agent.won}</td>
                      <td className="px-5 py-2.5">{formatMinutes(agent.avgResponseMinutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
