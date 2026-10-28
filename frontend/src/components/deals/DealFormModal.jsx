import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import { Field, Input, Select } from "../ui/FormField"
import ContactPickerField from "./ContactPickerField"
import { createDealSchema } from "../../lib/validation/deal.schema"
import { useCreateDeal, useUpdateDeal } from "../../hooks/useDeals"
import { useProperties } from "../../hooks/useProperties"
import { useAgents } from "../../hooks/useUsers"
import { useAuth } from "../../context/AuthContext"
import { DEAL_STAGE, DEAL_STAGE_LABELS } from "../../lib/enums"
import { fullName } from "../../lib/format"

export default function DealFormModal({ open, onClose, deal, defaultContact, onSaved }) {
  const { user } = useAuth()
  const isEdit = Boolean(deal)
  const createDeal = useCreateDeal()
  const updateDeal = useUpdateDeal()
  const mutation = isEdit ? updateDeal : createDeal
  const { data: properties } = useProperties({ limit: 100, status: "AVAILABLE" })
  const { data: agents } = useAgents()
  const [selectedContact, setSelectedContact] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(createDealSchema) })

  useEffect(() => {
    if (open) {
      const initialContact = deal?.contact || defaultContact || null
      setSelectedContact(initialContact)
      reset({
        contactId: initialContact?.id || "",
        propertyId: deal?.propertyId || "",
        ownerId: deal?.ownerId || user?.id || "",
        title: deal?.title || "",
        value: deal?.value || "",
        stage: deal?.stage || "OPEN",
        probability: deal?.probability ?? 10,
        expectedCloseDate: deal?.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : "",
      })
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deal, defaultContact])

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values) => {
    const payload = { ...values }
    if (!payload.expectedCloseDate) delete payload.expectedCloseDate
    if (!payload.propertyId) delete payload.propertyId
    try {
      const saved = isEdit
        ? await updateDeal.mutateAsync({ id: deal.id, payload })
        : await createDeal.mutateAsync(payload)
      reset()
      onSaved?.(saved)
    } catch {
      // surfaced below
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? "עריכת עסקה" : "עסקה חדשה"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            ביטול
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? "שמירה" : "יצירה"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="איש קשר" required error={errors.contactId?.message}>
          <Controller
            control={control}
            name="contactId"
            render={({ field }) => (
              <ContactPickerField
                value={field.value}
                selectedContact={selectedContact}
                onChange={(contact) => {
                  setSelectedContact(contact)
                  field.onChange(contact?.id || "")
                }}
              />
            )}
          />
        </Field>

        <Field label="כותרת העסקה" required error={errors.title?.message}>
          <Input {...register("title")} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="שווי עסקה (₪)" required error={errors.value?.message}>
            <Input type="number" dir="ltr" className="text-left" {...register("value")} />
          </Field>
          <Field label="סבירות סגירה (%)" error={errors.probability?.message}>
            <Input type="number" min="0" max="100" dir="ltr" className="text-left" {...register("probability")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="שלב" error={errors.stage?.message}>
            <Select {...register("stage")}>
              {DEAL_STAGE.map((s) => (
                <option key={s} value={s}>{DEAL_STAGE_LABELS[s]}</option>
              ))}
            </Select>
          </Field>
          <Field label="תאריך סגירה משוער" error={errors.expectedCloseDate?.message}>
            <Input type="date" dir="ltr" className="text-left" {...register("expectedCloseDate")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="נכס מקושר" error={errors.propertyId?.message}>
            <Select {...register("propertyId")}>
              <option value="">ללא נכס</option>
              {properties?.data?.map((p) => (
                <option key={p.id} value={p.id}>{p.title} · {p.city}</option>
              ))}
            </Select>
          </Field>
          <Field label="בעלים" error={errors.ownerId?.message}>
            <Select {...register("ownerId")}>
              <option value={user?.id}>{fullName(user)} (אני)</option>
              {agents?.data?.filter((a) => a.id !== user?.id).map((a) => (
                <option key={a.id} value={a.id}>{fullName(a)}</option>
              ))}
            </Select>
          </Field>
        </div>

        {mutation.isError && <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{mutation.error.message}</div>}
      </form>
    </Modal>
  )
}
