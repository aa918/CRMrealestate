import { ChevronLeft, ChevronRight } from "lucide-react"
import Button from "./Button"

export default function Pagination({ page, pages, total, limit, onPageChange }) {
  if (!total) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted">
      <span>
        מציג {from}–{to} מתוך {total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronRight className="size-4" />
          הקודם
        </Button>
        <span className="px-2 text-text">
          עמוד {page} מתוך {pages || 1}
        </span>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>
          הבא
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  )
}
