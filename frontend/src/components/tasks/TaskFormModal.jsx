import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import { Field, Input, Select, Textarea } from "../ui/FormField"
import { createTaskSchema } from "../../lib/validation/task.schema"
import { useCreateTask } from "../../hooks/useTasks"
import { useAgents } from "../../hooks/useUsers"
import { useAuth } from "../../context/AuthContext"
import { TASK_TYPE, TASK_TYPE_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS } from "../../lib/enums"
import { fullName } from "../../lib/format"

function defaultDueAt() {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  return d.toISOString().slice(0, 16)
}

export default function TaskFormModal({ open, onClose, contactId, leadId, defaultTitle, onCreated }) {
  const { user } = useAuth()
  const createTask = useCreateTask()
  const { data: agents } = useAgents()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: defaultTitle || "",
      type: "FOLLOW_UP",
      priority: "MEDIUM",
      dueAt: defaultDueAt(),
      assignedUserId: user?.id || "",
    },
  })

  const close = () => {
    reset()
    createTask.reset()
    onClose()
  }

  const onSubmit = async (values) => {
    const payload = { ...values, contactId, leadId }
    if (!payload.description) delete payload.description
    try {
      const task = await createTask.mutateAsync(payload)
      reset()
      onCreated?.(task)
    } catch {
      // surfaced below via createTask.error
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="משימה חדשה"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            ביטול
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            יצירת משימה
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="כותרת" required error={errors.title?.message}>
          <Input {...register("title")} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="סוג" error={errors.type?.message}>
            <Select {...register("type")}>
              {TASK_TYPE.map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="עדיפות" error={errors.priority?.message}>
            <Select {...register("priority")}>
              {TASK_PRIORITY.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="תאריך ושעת יעד" required error={errors.dueAt?.message}>
            <Input type="datetime-local" dir="ltr" className="text-left" {...register("dueAt")} />
          </Field>
          <Field label="מוקצה ל" error={errors.assignedUserId?.message}>
            <Select {...register("assignedUserId")}>
              <option value={user?.id}>{fullName(user)} (אני)</option>
              {agents?.data?.filter((a) => a.id !== user?.id).map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {fullName(agent)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="תיאור" error={errors.description?.message}>
          <Textarea {...register("description")} />
        </Field>

        {createTask.isError && (
          <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{createTask.error.message}</div>
        )}
      </form>
    </Modal>
  )
}
