import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import { Field, Input, Select, Textarea } from "../ui/FormField"
import { createLeadSchema } from "../../lib/validation/lead.schema"
import { useCreateLead } from "../../hooks/useLeads"
import { useAgents } from "../../hooks/useUsers"
import {
  LEAD_SOURCE,
  LEAD_SOURCE_LABELS,
  INTEREST_TYPE,
  INTEREST_TYPE_LABELS,
  PROPERTY_KIND,
  PROPERTY_KIND_LABELS,
} from "../../lib/enums"
import { fullName } from "../../lib/format"

export default function LeadFormModal({ open, onClose, onCreated }) {
  const createLead = useCreateLead()
  const { data: agents } = useAgents()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(createLeadSchema), defaultValues: { source: "MANUAL" } })

  const close = () => {
    reset()
    createLead.reset()
    onClose()
  }

  const onSubmit = async (values) => {
    const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== ""))
    try {
      const lead = await createLead.mutateAsync(payload)
      reset()
      onCreated?.(lead)
    } catch {
      // surfaced via createLead.error below
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="ליד חדש"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            ביטול
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            יצירת ליד
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="שם פרטי" required error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </Field>
          <Field label="שם משפחה" error={errors.lastName?.message}>
            <Input {...register("lastName")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="טלפון" required error={errors.phone?.message} hint="לדוגמה: 0521234567">
            <Input dir="ltr" className="text-left" {...register("phone")} />
          </Field>
          <Field label="אימייל" error={errors.email?.message}>
            <Input dir="ltr" className="text-left" {...register("email")} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="מקור" required error={errors.source?.message}>
            <Select {...register("source")}>
              {LEAD_SOURCE.map((s) => (
                <option key={s} value={s}>
                  {LEAD_SOURCE_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="סוג עניין" error={errors.interestType?.message}>
            <Select defaultValue="" {...register("interestType")}>
              <option value="">לא צויין</option>
              {INTEREST_TYPE.map((v) => (
                <option key={v} value={v}>
                  {INTEREST_TYPE_LABELS[v]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="סוג נכס" error={errors.propertyType?.message}>
            <Select defaultValue="" {...register("propertyType")}>
              <option value="">לא צויין</option>
              {PROPERTY_KIND.map((v) => (
                <option key={v} value={v}>
                  {PROPERTY_KIND_LABELS[v]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="עיר" error={errors.city?.message}>
            <Input {...register("city")} />
          </Field>
          <Field label="תקציב (₪)" error={errors.budget?.message}>
            <Input type="number" dir="ltr" className="text-left" {...register("budget")} />
          </Field>
          <Field label="חדרים" error={errors.bedrooms?.message}>
            <Input type="number" dir="ltr" className="text-left" {...register("bedrooms")} />
          </Field>
        </div>

        <Field label="סוכן מוקצה" error={errors.assignedUserId?.message} hint="אם לא יבחר, תתבצע הקצאה אוטומטית">
          <Select defaultValue="" {...register("assignedUserId")}>
            <option value="">הקצאה אוטומטית</option>
            {agents?.data?.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {fullName(agent)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="הודעה" error={errors.message?.message}>
          <Textarea {...register("message")} />
        </Field>

        {createLead.isError && (
          <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{createLead.error.message}</div>
        )}
      </form>
    </Modal>
  )
}
