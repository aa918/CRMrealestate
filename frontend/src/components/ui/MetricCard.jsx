import clsx from "clsx"
import { ArrowDown, ArrowUp } from "lucide-react"
import Card from "./Card"

/**
 * trend is optional on purpose: {direction: 'up'|'down', value: '12%'}.
 * When comparison data isn't available we simply omit it rather than
 * inventing a number.
 */
export default function MetricCard({ icon: Icon, label, value, trend, tone = "brand", hint }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        {Icon && (
          <span
            className={clsx(
              "flex size-9 items-center justify-center rounded-xl",
              tone === "brand" && "bg-info-bg text-brand",
              tone === "warning" && "bg-warning-bg text-warning",
              tone === "danger" && "bg-danger-bg text-danger",
              tone === "success" && "bg-success-bg text-success"
            )}
          >
            <Icon className="size-4.5" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-text">{value}</span>
        {trend && (
          <span
            className={clsx(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" ? "text-success" : "text-danger"
            )}
          >
            {trend.direction === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </Card>
  )
}
