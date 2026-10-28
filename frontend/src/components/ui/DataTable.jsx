import clsx from "clsx"
import { TableSkeleton } from "./LoadingSkeleton"
import ErrorState from "./ErrorState"

/**
 * Generic table shell shared by Leads/Contacts/Properties/Deals/Tasks.
 * columns: [{ key, header, render(row), className, headerClassName }]
 */
export default function DataTable({ columns, rows, isLoading, error, onRetry, emptyState, onRowClick, footer }) {
  if (isLoading) return <TableSkeleton cols={columns.length} />
  if (error) return <ErrorState description={error.message} onRetry={onRetry} />
  if (!rows || rows.length === 0) return emptyState || null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/70 text-right">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx("whitespace-nowrap px-4 py-3 text-xs font-semibold text-muted", col.headerClassName)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  "border-b border-border last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-slate-50"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx("px-4 py-3 align-middle", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}
