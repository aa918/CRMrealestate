import clsx from "clsx"

export default function LoadingSkeleton({ className }) {
  return <div className={clsx("animate-pulse rounded-lg bg-slate-200/80", className)} />
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 rounded-xl border border-border bg-white p-4">
          {Array.from({ length: cols }).map((__, c) => (
            <LoadingSkeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-28" />
      ))}
    </div>
  )
}
