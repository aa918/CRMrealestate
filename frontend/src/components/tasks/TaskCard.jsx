import clsx from "clsx"
import { CheckCircle2, Circle, Clock, X } from "lucide-react"
import StatusBadge from "../ui/StatusBadge"
import { formatDateTime, fullName } from "../../lib/format"
import { TASK_TYPE_LABELS, TASK_PRIORITY_LABELS } from "../../lib/enums"
import { TASK_PRIORITY_TONE } from "../../lib/statusTones"
import { useUpdateTask } from "../../hooks/useTasks"

export default function TaskCard({ task, showContact, compact }) {
  const updateTask = useUpdateTask()
  const isDone = task.status === "DONE"
  const isCancelled = task.status === "CANCELLED"
  const isOverdue = !isDone && !isCancelled && new Date(task.dueAt) < new Date()

  const toggleDone = () => {
    updateTask.mutate({ id: task.id, payload: { status: isDone ? "OPEN" : "DONE" } })
  }

  const cancel = (e) => {
    e.stopPropagation()
    updateTask.mutate({ id: task.id, payload: { status: "CANCELLED" } })
  }

  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-xl border bg-white p-3",
        isOverdue ? "border-danger/30" : "border-border",
        compact && "p-2.5"
      )}
    >
      <button
        onClick={toggleDone}
        disabled={updateTask.isPending}
        className="mt-0.5 text-muted hover:text-success disabled:opacity-50"
        aria-label="סמן כהושלם"
      >
        {isDone ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx("truncate text-sm font-medium text-text", (isDone || isCancelled) && "line-through text-muted")}>
            {task.title}
          </p>
          <StatusBadge tone={TASK_PRIORITY_TONE[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</StatusBadge>
        </div>
        {task.description && !compact && <p className="mt-0.5 truncate text-xs text-muted">{task.description}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
          <span className={clsx("flex items-center gap-1", isOverdue && "font-medium text-danger")}>
            <Clock className="size-3" />
            {formatDateTime(task.dueAt)}
          </span>
          <span>· {TASK_TYPE_LABELS[task.type]}</span>
          {task.assignedUser && <span>· {fullName(task.assignedUser)}</span>}
          {showContact && task.contact && <span>· {fullName(task.contact)}</span>}
        </div>
      </div>

      {!isDone && !isCancelled && (
        <button onClick={cancel} className="text-muted hover:text-danger" aria-label="ביטול משימה" title="ביטול משימה">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
