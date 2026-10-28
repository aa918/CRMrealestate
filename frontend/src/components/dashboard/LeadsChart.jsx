import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import Card from "../ui/Card"
import LoadingSkeleton from "../ui/LoadingSkeleton"
import EmptyState from "../ui/EmptyState"
import { TrendingUp } from "lucide-react"

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-text">{label}</p>
      <p className="text-muted">{payload[0].value} לידים חדשים</p>
    </div>
  )
}

export default function LeadsChart({ data, isLoading }) {
  const total = data?.reduce((sum, p) => sum + p.count, 0) || 0

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">לידים חדשים - 7 ימים אחרונים</h3>
          <p className="text-xs text-muted">סה״כ {total} לידים בתקופה</p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-lg bg-info-bg text-brand">
          <TrendingUp className="size-4" />
        </span>
      </div>

      {isLoading ? (
        <LoadingSkeleton className="h-56" />
      ) : total === 0 ? (
        <EmptyState title="אין עדיין לידים להצגה" description="לידים חדשים יופיעו כאן ברגע שיתקבלו" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3367DC" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3367DC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#E6EAF1" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#8290A4" }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#8290A4" }} width={28} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#3367DC" strokeWidth={2} fill="url(#leadsFill)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
