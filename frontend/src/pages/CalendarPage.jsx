import { useMemo, useState } from "react"
import clsx from "clsx"
import { ChevronRight, ChevronLeft, CalendarDays } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import TaskCard from "../components/tasks/TaskCard"
import EmptyState from "../components/ui/EmptyState"
import LoadingSkeleton from "../components/ui/LoadingSkeleton"
import { useTasks } from "../hooks/useTasks"

const WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]
const PRIORITY_DOT = { LOW: "bg-slate-400", MEDIUM: "bg-brand", HIGH: "bg-warning", URGENT: "bg-danger" }

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - start.getDay())
  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => new Date())

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const days = useMemo(() => buildMonthGrid(year, month), [year, month])

  const monthStart = days[0]
  const monthEnd = days[days.length - 1]

  const { data, isLoading } = useTasks({
    dueFrom: monthStart.toISOString(),
    dueTo: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate(), 23, 59, 59).toISOString(),
    limit: 100,
  })

  const tasksByDay = useMemo(() => {
    const map = new Map()
    for (const task of data?.data || []) {
      const key = new Date(task.dueAt).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(task)
    }
    return map
  }, [data])

  const selectedTasks = tasksByDay.get(selectedDay.toDateString()) || []

  return (
    <div>
      <PageHeader
        title="יומן"
        description="משימות ופגישות מסודרות לפי תאריך יעד"
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-md p-1.5 hover:bg-slate-100">
              <ChevronRight className="size-4" />
            </button>
            <span className="min-w-[110px] text-center text-sm font-medium text-text">
              {cursor.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-md p-1.5 hover:bg-slate-100">
              <ChevronLeft className="size-4" />
            </button>
          </div>
        }
      />

      {isLoading ? (
        <LoadingSkeleton className="h-96" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-white lg:col-span-2">
            <div className="grid grid-cols-7 border-b border-border bg-slate-50/70 text-center text-xs font-semibold text-muted">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const items = tasksByDay.get(day.toDateString()) || []
                const isCurrentMonth = day.getMonth() === month
                const isToday = sameDay(day, new Date())
                const isSelected = sameDay(day, selectedDay)
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={clsx(
                      "flex h-24 flex-col items-start gap-1 border-b border-l border-border p-1.5 text-right last:border-l-0",
                      !isCurrentMonth && "bg-slate-50/50 text-muted",
                      isSelected && "bg-info-bg"
                    )}
                  >
                    <span
                      className={clsx(
                        "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday && "bg-brand text-white"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex w-full flex-col gap-0.5 overflow-hidden">
                      {items.slice(0, 2).map((task) => (
                        <span key={task.id} className="flex items-center gap-1 truncate text-[10px] text-text">
                          <span className={clsx("size-1.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />
                          {task.title}
                        </span>
                      ))}
                      {items.length > 2 && <span className="text-[10px] text-muted">+{items.length - 2} עוד</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">
              {selectedDay.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            {selectedTasks.length === 0 ? (
              <EmptyState icon={CalendarDays} title="אין משימות ביום זה" description="בחרו יום אחר מהיומן" />
            ) : (
              <div className="space-y-2">
                {selectedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} showContact compact />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
