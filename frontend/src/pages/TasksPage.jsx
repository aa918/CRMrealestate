import { useMemo, useState } from "react"
import { Plus, ListChecks } from "lucide-react"
import clsx from "clsx"
import PageHeader from "../components/ui/PageHeader"
import Button from "../components/ui/Button"
import FilterBar from "../components/ui/FilterBar"
import EmptyState from "../components/ui/EmptyState"
import ErrorState from "../components/ui/ErrorState"
import Pagination from "../components/ui/Pagination"
import { TableSkeleton } from "../components/ui/LoadingSkeleton"
import TaskCard from "../components/tasks/TaskCard"
import TaskFormModal from "../components/tasks/TaskFormModal"
import { useTasks, useTasksToday } from "../hooks/useTasks"
import { useAgents } from "../hooks/useUsers"
import { TASK_TYPE, TASK_TYPE_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS } from "../lib/enums"
import { fullName } from "../lib/format"

const SEGMENTS = [
  { key: "today", label: "היום" },
  { key: "overdue", label: "חריגות" },
  { key: "upcoming", label: "קרובות" },
  { key: "completed", label: "הושלמו" },
  { key: "all", label: "הכל" },
]

const selectBase = "focus-ring h-10 rounded-lg border border-border bg-white px-3 text-sm text-text"

export default function TasksPage() {
  const [segment, setSegment] = useState("today")
  const [filters, setFilters] = useState({ assignedUserId: "", type: "", priority: "" })
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const { data: agents } = useAgents()

  const today = useTasksToday()

  const query = useMemo(() => {
    const q = { page, limit: 20 }
    Object.entries(filters).forEach(([k, v]) => { if (v) q[k] = v })
    if (segment === "overdue") q.overdue = true
    if (segment === "upcoming") {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      q.dueFrom = tomorrow.toISOString()
    }
    if (segment === "completed") q.status = "DONE"
    return q
  }, [segment, filters, page])

  const list = useTasks(query)
  const isToday = segment === "today"
  const { data, isLoading, isError, error, refetch } = isToday ? { ...today, data: today.data ? { data: today.data } : null } : list

  const setFilter = (key, value) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <PageHeader
        title="משימות"
        description="כל הפולו-אפים, השיחות והפגישות שממתינים לצוות"
        actions={
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            משימה חדשה
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-1 rounded-xl border border-border bg-white p-1">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            onClick={() => { setSegment(s.key); setPage(1) }}
            className={clsx(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              segment === s.key ? "bg-navy text-white" : "text-muted hover:bg-slate-50"
            )}
          >
            {s.label}
            {s.key === "today" && today.data?.length > 0 && (
              <span className="mr-1.5 rounded-full bg-white/20 px-1.5 text-xs">{today.data.length}</span>
            )}
          </button>
        ))}
      </div>

      {!isToday && (
        <FilterBar>
          <select className={selectBase} value={filters.assignedUserId} onChange={(e) => setFilter("assignedUserId", e.target.value)}>
            <option value="">כל הסוכנים</option>
            {agents?.data?.map((a) => <option key={a.id} value={a.id}>{fullName(a)}</option>)}
          </select>
          <select className={selectBase} value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
            <option value="">כל הסוגים</option>
            {TASK_TYPE.map((t) => <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>)}
          </select>
          <select className={selectBase} value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
            <option value="">כל העדיפויות</option>
            {TASK_PRIORITY.map((p) => <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>)}
          </select>
        </FilterBar>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} cols={1} />
      ) : isError ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : !data?.data?.length ? (
        <EmptyState icon={ListChecks} title="אין משימות להצגה" description="כל המשימות בקטגוריה זו הושלמו" actionLabel="משימה חדשה" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="space-y-2">
          {data.data.map((task) => (
            <TaskCard key={task.id} task={task} showContact />
          ))}
        </div>
      )}

      {!isToday && data?.pagination && (
        <div className="mt-2 rounded-xl border border-border bg-white">
          <Pagination {...data.pagination} onPageChange={setPage} />
        </div>
      )}

      <TaskFormModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => setCreateOpen(false)} />
    </div>
  )
}
