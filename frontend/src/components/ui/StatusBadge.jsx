import clsx from "clsx"

const toneClasses = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-brand",
  neutral: "bg-slate-100 text-slate-600",
}

export default function StatusBadge({ tone = "neutral", children, className, dot }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[tone] || toneClasses.neutral,
        className
      )}
    >
      {dot && <span className={clsx("size-1.5 rounded-full", toneClasses[tone].split(" ")[1])} style={{ backgroundColor: "currentColor" }} />}
      {children}
    </span>
  )
}
